#!/usr/bin/env node
// Runtime design audit (D-099). Loads every app route mapped in design/fidelity.config.json and checks it
// against the reference concept: required components, computed styles, overflow, touch targets, fonts, colour budget.
// It also saves app screenshots next to the reference PNGs and writes an HTML side-by-side report for sign-off.
//
// Usage:  node tools/design-audit.mjs --base http://localhost:5173 [--config design/fidelity.config.json] [--only 07-goal]
//         node tools/design-audit.mjs --reference      (self-test: audits the reference screens themselves; must pass)
// Needs: npm i -D playwright  (npx playwright install chromium)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SELF = args.includes('--reference');
const ROOT = opt('--root', '.');
const CONFIG = opt('--config', path.join(ROOT, 'design/fidelity.config.json'));
const ONLY = opt('--only', null);
const OUT = opt('--out', path.join(ROOT, 'design-audit-report'));
const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const anatomy = JSON.parse(fs.readFileSync(path.join(ROOT, 'design/reference/anatomy.json'), 'utf8'));
const finger = JSON.parse(fs.readFileSync(path.join(ROOT, 'design/reference/style-fingerprint.json'), 'utf8'));
const VP = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
for (const [fid, route] of Object.entries(cfg.routes)) {
  if (ONLY && fid !== ONLY) continue;
  if (!route && !SELF) { results.push({ fid, skipped: 'no route mapped yet' }); continue; }
  for (const vp of Object.keys(VP)) for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: VP[vp], colorScheme: theme, deviceScaleFactor: 1, hasTouch: vp === 'phone' });
    const page = await ctx.newPage();
    const url = SELF ? pathToFileURL(path.resolve(ROOT, `design/reference/screens/${fid}.html`)).href + `?theme=${theme}`
                     : new URL(route, opt('--base', 'http://localhost:5173')).href;
    const fails = []; const notes = [];
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      if (!SELF && cfg.themeSetter === 'data-theme') await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      if (cfg.setup?.[fid]) await page.evaluate(cfg.setup[fid]);
      await page.waitForTimeout(200);
      const r = await page.evaluate(() => {
        const cs = (s, p) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[p] : null; };
        const da = {}; document.querySelectorAll('[data-da]').forEach(e => { const b = e.getBoundingClientRect(); if (getComputedStyle(e).display !== 'none' && b.width > 0) da[e.dataset.da] = (da[e.dataset.da] || 0) + 1; });
        const inView = e => { const b = e.getBoundingClientRect(); return b.top < innerHeight && b.bottom > 0 && b.width > 0; };
        const primaries = [...document.querySelectorAll('[data-da=primary-cta], .btn.p, [data-variant=primary]')].filter(inView).length;
        const small = [...document.querySelectorAll('button,[role=button],[role=switch],[role=checkbox],input,select,a.btn,.chip')].filter(e => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && (b.width < 24 || b.height < 24); }).length;
        return {
          da, primaries, small,
          overflow: document.documentElement.scrollWidth - innerWidth,
          fonts: { display: document.fonts.check('700 32px "Schibsted Grotesk"'), text: document.fonts.check('400 16px "Inter"') },
          style: {
            'body.background': cs('body', 'backgroundColor'), 'h1.font': cs('h1', 'fontFamily'), 'h1.weight': cs('h1', 'fontWeight'),
            'primary.bg': cs('.btn.p,[data-variant=primary]', 'backgroundColor'), 'primary.radius': cs('.btn.p,[data-variant=primary]', 'borderTopLeftRadius'),
            'card.radius': cs('.card,[data-da=card]', 'borderTopLeftRadius'),
            'tabbar.height': cs('[data-da=tabbar]', 'height'), 'tabbar.display': cs('[data-da=tabbar]', 'display'),
            'header.height': cs('[data-da=header] .in,[data-da=header] > div', 'height')
          }
        };
      });
      // 1 required components (from the reference anatomy, light theme)
      const req = anatomy[fid]?.required?.[vp] || {};
      for (const k of Object.keys(req)) if (!r.da[k] && !(cfg.optionalComponents || []).includes(k)) fails.push(`missing component [data-da=${k}]`);
      // 2 computed style fingerprint (light theme values; dark checked for body only via token)
      if (theme === 'light') {
        const ref = finger[fid]?.[vp] || {};
        for (const k of ['h1.font', 'h1.weight', 'primary.bg', 'primary.radius', 'card.radius', 'tabbar.height', 'tabbar.display', 'header.height', 'body.background']) {
          if (ref[k] == null || r.style[k] == null) continue;
          const a = k.endsWith('font') ? ref[k].split(',')[0].replace(/"/g, '') : ref[k];
          const b = k.endsWith('font') ? r.style[k].split(',')[0].replace(/"/g, '') : r.style[k];
          if (a !== b) fails.push(`${k}: expected ${a}, got ${b}`);
        }
      }
      // 3 layout and access
      if (r.overflow > 0) fails.push(`horizontal overflow ${r.overflow}px (text cut off on phones)`);
      if (r.small > 0) fails.push(`${r.small} interactive element(s) smaller than 24 × 24 px`);
      if (!r.fonts.display || !r.fonts.text) fails.push('brand fonts not loaded (self-host design/fonts)');
      if (r.primaries > (cfg.maxPrimaryInView ?? 1) && !(cfg.allowMultiPrimary || []).includes(fid)) notes.push(`${r.primaries} primary buttons in first view (budget 1)`);
      await page.screenshot({ path: path.join(OUT, `${fid}--${vp}-${theme}.png`) });
    } catch (e) { fails.push('load error: ' + e.message.split('\n')[0]); }
    results.push({ fid, vp, theme, url, fails, notes });
    await ctx.close();
  }
}
await browser.close();

// report
const refPng = (fid, vp, th) => path.relative(OUT, path.join(ROOT, `design/reference/png/${fid}/${vp}-${th}.png`));
const rows = results.map(x => x.skipped ? `<tr><td>${x.fid}</td><td colspan=4>${x.skipped}</td></tr>` :
  `<tr class="${x.fails.length ? 'f' : 'p'}"><td>${x.fid}<br><small>${x.vp} · ${x.theme}</small></td><td>${x.fails.length ? '✗ ' + x.fails.join('<br>') : '✓ pass'}${x.notes.length ? '<br><i>' + x.notes.join('<br>') + '</i>' : ''}</td>
  <td><img src="${refPng(x.fid, x.vp, x.theme)}" loading="lazy"></td><td><img src="${x.fid}--${x.vp}-${x.theme}.png" loading="lazy"></td><td>☐ Owner OK</td></tr>`).join('');
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Design audit</title><style>body{font:14px system-ui;margin:24px}table{border-collapse:collapse;width:100%}td{border-top:1px solid #ddd;padding:8px;vertical-align:top}img{width:320px;max-height:640px;object-fit:cover;object-position:top;border:1px solid #ccc}tr.f td:first-child{border-left:4px solid #B42318}tr.p td:first-child{border-left:4px solid #16794A}</style>
<h1>Design audit · ${new Date().toISOString().slice(0, 10)}</h1><p>Left: concept reference. Right: app. A screen is done when the checks pass AND the owner ticks “OK” (docs/29 §6).</p><table><tr><th>Screen</th><th>Checks</th><th>Reference</th><th>App</th><th>Sign-off</th></tr>${rows}</table>`);
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
const failed = results.filter(x => x.fails?.length);
console.log(`design-audit: ${results.length} checks · ${failed.length} failing · report ${path.join(OUT, 'index.html')}`);
for (const f of failed.slice(0, 40)) console.log(`  ✗ ${f.fid} ${f.vp}/${f.theme}: ${f.fails.join(' | ')}`);
process.exit(failed.length ? 1 : 0);
