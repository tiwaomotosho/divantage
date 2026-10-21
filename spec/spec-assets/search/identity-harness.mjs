// Reference harness for identity search + tool-for-identity routing (search-config.json → identity_search).
import MiniSearch from 'minisearch'; import fs from 'fs'; import path from 'path';
const pack = process.argv[2];
const J = p => JSON.parse(fs.readFileSync(path.join(pack,p)));
const cfg = J('spec-assets/search/search-config.json').identity_search;
const ts = J('spec-assets/search/search-test-set.json');
const ids = J('spec-assets/taxonomy/identities/identities.json').values;
const fams = Object.fromEntries(J('spec-assets/taxonomy/identities/families.json').values.map(f=>[f.slug,f.label]));
const secs = Object.fromEntries(J('spec-assets/taxonomy/identities/sectors.json').values.map(s=>[s.slug,s.label]));
const reg = J('08_Starter_Catalogue/registry/tools-registry.json').values;
const byslug = Object.fromEntries(ids.map(i=>[i.slug,i]));
const stem = t => { t=t.toLowerCase(); if (t.length>4){ if (/(sses|xes|ches|shes)$/.test(t)) return t.slice(0,-2); if (t.endsWith('s') && !t.endsWith('ss')) return t.slice(0,-1);} return t; };
const clean = q => q.toLowerCase().replace(/^\s*(i am an?|i'm an?|im an?|i work as an?|as an?|for an?)\s+/,'').trim();
const docs = ids.map(i=>({id:i.slug,label:i.label,aliases:i.aliases.join(' | '),parent:i.parent?byslug[i.parent].label:'',family:fams[i.family],sector:secs[i.sector],kind:i.kind,isParent:!i.parent}));
const ms = new MiniSearch({fields:Object.keys(cfg.fields),storeFields:['label','aliases','kind','isParent'],processTerm:t=>stem(t),
  tokenize:s=>s.split(/[\s,|/()&-]+/).filter(Boolean),
  searchOptions:{boost:cfg.fields,prefix:true,fuzzy:t=>t.length>=5?0.2:false,processTerm:t=>stem(t)}});
ms.addAll(docs);
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
function searchIds(q){
  const c=clean(q); const nq=norm(c); const nqs=norm(c.split(/\s+/).map(stem).join(' '));
  const res=ms.search(c,{combineWith:'AND'}); const r2=res.length?res:ms.search(c,{combineWith:'OR'});
  for (const r of r2){
    let s=r.score; const names=[r.label,...r.aliases.split(' | ')].map(norm);
    if (names.includes(nq)||names.includes(nqs)) s+=1e6;
    else if (norm(r.label).startsWith(nq)) s*=2;
    if (r.isParent) s*=1.05; if (r.kind==='life_role') s*=0.95; r.final=s;
  }
  return r2.sort((a,b)=>b.final-a.final);
}
const toolNames = reg.map(t=>({slug:t.slug,names:[t.name,t.slug,t.name.replace(/^Microsoft |^Google |^Adobe /,'')].map(x=>x.toLowerCase())}));
function route(q){
  const m=q.toLowerCase().split(' for ');
  if (m.length!==2) return null;
  const tool=toolNames.find(t=>t.names.includes(m[0].trim())); if(!tool) return null;
  const id=searchIds(m[1])[0]; if(!id) return null;
  return `/for/${id.id}/${tool.slug}`;
}
let pass=0,total=0;
for (const t of ts.identity_queries){ total++;
  const r=searchIds(t.query).slice(0,5).map(x=>x.id);
  const ok = t.expect_first ? r[0]===t.expect_first : t.expect_any_top5.some(e=>r.includes(e));
  if(ok) pass++; console.log((ok?'PASS':'FAIL').padEnd(5),t.category.padEnd(18),JSON.stringify(t.query).padEnd(24),r.slice(0,4).join(', '));
}
for (const t of ts.route_queries){ total++; const r=route(t.query); const ok=r===t.expect_route; if(ok) pass++; console.log((ok?'PASS':'FAIL').padEnd(5),'route'.padEnd(18),JSON.stringify(t.query).padEnd(36),r); }
// Skills index (Explore by → Skills; also shown as a 'Skills' group in the landing autocomplete)
const sk = J('spec-assets/taxonomy/skills.json').values; const needsJ = Object.fromEntries(J('spec-assets/taxonomy/needs.json').values.map(n=>[n.id,n.label]));
const regById = Object.fromEntries(reg.map(t=>[t.id,t.name]));
const sdocs = sk.map(s=>({id:s.slug,label:s.label,kw:(s.keywords||[]).join(' | '),desc:s.description,needs:s.need_ids.map(n=>needsJ[n]).join(' | '),tools:s.tool_ids.slice(0,12).map(t=>regById[t]).join(' | ')}));
const sms = new MiniSearch({fields:['label','kw','needs','tools','desc'],storeFields:['label'],processTerm:t=>stem(t),tokenize:s=>s.split(/[\s,|/()&-]+/).filter(Boolean),
  searchOptions:{boost:{label:4,kw:3,needs:2,tools:2,desc:1},prefix:true,fuzzy:t=>t.length>=5?0.2:false,processTerm:t=>stem(t)}});
sms.addAll(sdocs);
for (const t of (ts.skill_queries||[])){ total++; let r=sms.search(t.query,{combineWith:'AND'}); if(!r.length) r=sms.search(t.query,{combineWith:'OR'}); r=r.slice(0,3).map(x=>x.id);
  const ok=t.expect_any_top3.some(e=>r.includes(e)); if(ok) pass++; console.log((ok?'PASS':'FAIL').padEnd(5),'skill'.padEnd(18),JSON.stringify(t.query).padEnd(24),r.join(', ')); }
const size = Buffer.byteLength(JSON.stringify(docs.map(d=>({s:d.id,l:d.label,a:d.aliases,f:d.family,k:d.kind}))));
console.log(`\nIdentity+route+skill tests: ${pass}/${total}. Raw identities index ≈ ${(size/1024).toFixed(0)} KB before gzip.`);
if (process.argv[3]==='--write'){ const p=path.join(pack,'spec-assets/search/search-test-set.json'); const j=JSON.parse(fs.readFileSync(p)); j.identity_last_run={date:new Date().toISOString().slice(0,10),passed:`${pass}/${total}`}; fs.writeFileSync(p,JSON.stringify(j,null,2)); }
