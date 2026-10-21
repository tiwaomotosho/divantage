// Reference harness: implements spec-assets/search/search-config.json on MiniSearch 7.1.2 and scores search-test-set.json.
// Prototype for builders — port the same logic into src/lib/search-*.ts. Usage: node reference-harness.mjs <pack-root> [--write]
import MiniSearch from 'minisearch';
import fs from 'fs'; import path from 'path';
const [,, pack] = process.argv;
const cfg = JSON.parse(fs.readFileSync(path.join(pack,'spec-assets/search/search-config.json')));
const ts = JSON.parse(fs.readFileSync(path.join(pack,'spec-assets/search/search-test-set.json')));
const vocab = JSON.parse(fs.readFileSync(path.join(pack,'spec-assets/taxonomy/vocabularies.json')));
const cats = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(pack,'spec-assets/taxonomy/categories.json'))).values.map(c=>[c.slug,c]));
const fams = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(pack,'spec-assets/taxonomy/task-families.json'))).values.map(c=>[c.slug,c]));
const swp = Object.fromEntries(vocab.pricing_model.values.map(v=>[v.id,v.starts_without_paying]));
const R = path.join(pack,'08_Starter_Catalogue/records'); const docs=[];
for (const t of fs.readdirSync(R)) for (const f of fs.readdirSync(path.join(R,t))) {
  const r = JSON.parse(fs.readFileSync(path.join(R,t,f)));
  const type = {tools:'tool',tasks:'task',resources:'resource',playbooks:'playbook',comparisons:'comparison'}[t];
  const catIds = r.category_ids||[];
  const title = r.name || [r.title, r.short_title].filter(Boolean).join(' ');
  let s = type==='tool' ? swp[r.pricing.model] : (type==='resource' ? r.cost_status==='free' : null);
  docs.push({ id:r.id, type, title,
    aliases:[...(r.search_aliases||[]), ...catIds.flatMap(c=>cats[c]?.aliases||[])].join(' '),
    summary: r.summary||r.problem_statement||r.outcome||r.decision_question||'',
    taxonomy:[...catIds.map(c=>cats[c]?.label), r.family_id?fams[r.family_id].label:''].join(' '),
    description: r.description||r.expected_outcome||r.learning_outcome||'',
    body:[...(r.steps||[]).map(s=>s.title+' '+s.instructions), ...(r.best_for||[]), ...(r.key_capabilities||[]).map(k=>k.text)].join(' '),
    starts: s, platforms: (r.platforms?.verification_status!=='unverified') ? (r.platforms?.values||[]) : [] });
}
const stop = new Set(cfg.options.stopwords); const sp = cfg.options.spelling_variants;
const syn = {}; for (const [k,vs] of Object.entries(cfg.options.synonyms)) { for (const w of [k,...vs]) { syn[w] = new Set([...(syn[w]||[]), k, ...vs].filter(x=>x!==w && !x.includes(' '))); } }
const norm = t => { t=t.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase(); return sp[t]||t; };
const processTerm = t => { t = norm(t); return stop.has(t)? null : t; };
const fields=['title','aliases','summary','taxonomy','description','body'];
const ms = new MiniSearch({ fields, storeFields:['type','starts','platforms','title'], processTerm,
  searchOptions:{ boost: cfg.options.boost, fuzzy:(term)=> term.length>=5?0.2:(term.length>=4?0.1:false), processTerm } });
ms.addAll(docs);
const costTrig = cfg.ranking_adjustments.find(r=>r.rule==='cost_intent').trigger_terms;
const platTrig = cfg.ranking_adjustments.find(r=>r.rule==='platform_intent').trigger_terms;
function search(qRaw){
  const q = qRaw.slice(0,120);
  const terms = q.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
  const content = terms.map(processTerm).filter(Boolean);
  if (!content.length) return [];
  const expanded = [];
  const queries = content.map(t => ({ combineWith:'OR', queries:[t, ...[...(syn[t]||[])]].map((w,i)=>w) }));
  const opts = (comb)=>({ combineWith: comb, prefix:(term,i,arr)=> i===arr.length-1 });
  // build a query tree: AND across user terms, OR inside synonym group (synonyms downweighted via boostTerm)
  const tree = (comb)=>({ combineWith: comb, queries: content.map(t=>({ combineWith:'OR', queries:[t, ...(syn[t]||[])] })) });
  let res = ms.search(tree('AND'), { ...opts('AND'), boostTerm:(term)=> content.includes(term)?1:0.6 });
  const andEmpty = res.length===0;
  if (!res.length) res = ms.search(tree('OR'), { ...opts('OR'), boostTerm:(term)=> content.includes(term)?1:0.6 });
  const nq = q.toLowerCase().replace(/[^a-z0-9]/g,'');
  const cost = costTrig.some(w=>q.toLowerCase().includes(w));
  const plat = Object.entries(platTrig).filter(([w])=>terms.includes(w)).map(([,p])=>p);
  const nl = content.length>=3 || /^(how|what|where|which)\b/i.test(q);
  for (const r of res) {
    let s=r.score;
    if (cost && r.starts===true) s*=1.4;
    if (plat.length && plat.some(p=>(r.platforms||[]).includes(p))) s*=1.3;
    if (nl && (r.type==='task'||r.type==='playbook')) s*=1.2;
    const d = docs.find(d=>d.id===r.id);
    if ([d.title,...d.aliases.split(' ')].some(x=>x.toLowerCase().replace(/[^a-z0-9]/g,'')===nq) || d.title.toLowerCase().replace(/[^a-z0-9]/g,'')===nq) s+=1e6;
    r.final=s;
  }
  res.sort((a,b)=>b.final-a.final); res.andEmpty=andEmpty; return res;
}
const results=[]; let pos=0,posHit=0,exact=0,exactHit=0,ok=true;
for (const t of ts.queries) {
  const res = search(t.query); const top=res.slice(0,3).map(r=>r.id);
  let pass;
  if (t.expected_any_top3.length) { pos++; pass = t.expected_any_top3.some(e=>top.includes(e)); if(pass) posHit++; }
  else pass = res.andEmpty || t.category==='invalid';
  if (t.must_be_first) { exact++; if (res[0]?.id===t.must_be_first) exactHit++; else pass=false; }
  const firstTool = res.find(r=>r.type==='tool');
  if (t.must_not_rank_first_as_free && firstTool && firstTool.starts!==true) pass=false;
  results.push({query:t.query.slice(0,60),pass,top3:top}); console.log((pass?'PASS':'FAIL').padEnd(5), t.category.padEnd(18), JSON.stringify(t.query.slice(0,40)).padEnd(44), top.join(', '));
}
if (process.argv[3]==='--write') { const p=path.join(pack,'spec-assets/search/search-test-set.json'); const j=JSON.parse(fs.readFileSync(p)); j.last_run={date:new Date().toISOString().slice(0,10),engine:'minisearch@7.1.2 via reference-harness.mjs',positive_top3:`${posHit}/${pos}`,exact_first:`${exactHit}/${exact}`,all_pass:results.every(r=>r.pass)}; fs.writeFileSync(p, JSON.stringify(j,null,2)); }
console.log(`\nPositive: ${posHit}/${pos} = ${(100*posHit/pos).toFixed(0)}%  Exact-first: ${exactHit}/${exact}`);
