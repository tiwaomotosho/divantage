// Reference harness for "Jump straight to a goal" search (search-config.json -> goal_search). V2.6, extended V2.7: kits + natural-language ('I want to ...').
// Usage: node spec-assets/search/goal-harness.mjs <pack root> [--write]   (needs: npm i minisearch@7.1.2)
import MiniSearch from 'minisearch'; import fs from 'fs'; import path from 'path';
const pack = process.argv[2];
const J = p => JSON.parse(fs.readFileSync(path.join(pack, p)));
const cfg = J('spec-assets/search/search-config.json').goal_search;
const ts = J('spec-assets/search/search-test-set.json');
const goals = J('spec-assets/taxonomy/goals.json').values;
const needs = Object.fromEntries(J('spec-assets/taxonomy/needs.json').values.map(n => [n.slug, n.label]));
const reg = Object.fromEntries(J('08_Starter_Catalogue/registry/tools-registry.json').values.map(t => [t.id, t]));
const stem = t => { t = t.toLowerCase(); if (t.length > 4) { if (/(sses|xes|ches|shes)$/.test(t)) return t.slice(0, -2); if (t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1); } return t; };
const kits = J('spec-assets/taxonomy/goal-kits.json').values;
const LEAD = /^(i (really )?(want|need|wish|would like|'d like|wanna|have) to |i'd like to |i want a |i need a |i want |how (do|can|should) i |how to |help me( to)? |can you help me( to)? |where (can|do) i |what is the best way to |show me how to |i am looking for |i'm looking for |looking for )/i;
const clean = q => { let x = q.trim().replace(/[?!.]+$/, ''); for (let i = 0; i < 2; i++) x = x.replace(LEAD, ''); return x.replace(/\b(please|pls|for free online)\b/gi, '').trim() || q; };
const docs = goals.map(g => ({
  id: g.slug, label: g.label, terms: g.search_terms.join(' | '), need: needs[g.need],
  tools: g.tool_ids.map(t => reg[t].name).join(' | '),
  top: g.tool_ids.slice(0, 3).map(t => reg[t].name).join(' | '), markets: g.markets
}));
const ms = new MiniSearch({
  fields: Object.keys(cfg.fields), storeFields: ['label', 'markets'], processTerm: t => stem(t),
  tokenize: s => s.split(/[\s,|/()&-]+/).filter(Boolean),
  searchOptions: { boost: cfg.fields, prefix: true, fuzzy: t => t.length >= 5 ? 0.2 : false, processTerm: t => stem(t) }
});
ms.addAll(docs);
for (const k of kits) ms.add({ id: 'kit:' + k.slug, label: k.title, terms: k.search_phrases.join(' | ') + ' | ' + k.promise, need: 'Kit', tools: '', top: '', markets: k.markets.concat(['all']) });
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
function search(q0, market) {
  const q = clean(q0);
  let r = ms.search(q, { combineWith: 'AND' }); if (!r.length) r = ms.search(q, { combineWith: 'OR' });
  for (const x of r) { x.final = x.score * (String(x.id).startsWith('kit:') ? cfg.kit_boost || 1.3 : 1); if (market && x.markets.includes(market)) x.final *= cfg.market_boost; if (norm(x.label).includes(norm(q))) x.final *= 1.5; }
  return r.sort((a, b) => b.final - a.final);
}
let pass = 0, total = 0;
for (const t of ts.goal_queries) {
  total++; const r = search(t.query, t.market).slice(0, 5).map(x => x.id);
  const ok = t.expect_any_top5.some(e => r.includes(e)); if (ok) pass++;
  console.log((ok ? 'PASS' : 'FAIL').padEnd(5), JSON.stringify(t.query).padEnd(30), r.slice(0, 3).join(', '));
}
const raw = Buffer.byteLength(JSON.stringify(docs.map(d => ({ s: d.id, l: d.label, t: d.terms, n: d.need, o: d.top }))));
console.log(`\nGoal search tests: ${pass}/${total}. Raw goal index ≈ ${(raw / 1024).toFixed(0)} KB before gzip (${goals.length} goals).`);
if (process.argv[3] === '--write') { const p = path.join(pack, 'spec-assets/search/search-test-set.json'); const j = JSON.parse(fs.readFileSync(p)); j.goal_last_run = { date: new Date().toISOString().slice(0, 10), passed: `${pass}/${total}` }; fs.writeFileSync(p, JSON.stringify(j, null, 2)); }
process.exit(pass === total ? 0 : 1);
