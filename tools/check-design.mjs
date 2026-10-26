#!/usr/bin/env node
// Static design lint (D-099). Fails the build when app code drifts from the concept.
// Usage: node tools/check-design.mjs [srcDir=src] [--design design] [--assets public/assets]
// Exit 1 on any ERROR. Wire into CI and the pre-commit hook (see docs/29 §4).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const SRC = pos[0] || 'src';
const DESIGN = opt('--design', 'design');
const ASSETS = opt('--assets', fs.existsSync('public/assets') ? 'public/assets' : 'assets');

const errors = []; const warns = [];
const E = (f, l, m) => errors.push(`${f}:${l}  ${m}`);
const W = (f, l, m) => warns.push(`${f}:${l}  ${m}`);

function walk(d, out = []) {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const manifest = fs.existsSync(path.join(ASSETS, 'photos/manifest.json')) ? JSON.parse(fs.readFileSync(path.join(ASSETS, 'photos/manifest.json'))) : { photos: {} };
const iconNames = fs.existsSync(path.join(ASSETS, 'icons/outline')) ? fs.readdirSync(path.join(ASSETS, 'icons/outline')).map(f => f.replace('.svg', '')) : [];

const RULES = [
  // [regex, level, message, fileFilter]
  [/#[0-9a-fA-F]{3,8}\b(?![\w-])/g, 'E', 'Raw hex colour. Use a token: var(--da-color-*) or a Tailwind class mapped to tokens.', /\.(tsx?|jsx?|css|scss|mdx?)$/],
  [/\b(rgba?|hsla?|oklch|oklab|lab|lch)\(/g, 'E', 'Raw colour function. Use a token.', /\.(tsx?|jsx?|css|scss)$/],
  [/font-family\s*:\s*(?!var\(--da-font)/g, 'E', 'Font family must be var(--da-font-family-*).', /\.(css|scss|tsx?|jsx?)$/],
  [/fontFamily\s*:\s*['"`]/g, 'E', 'Inline fontFamily literal. Use the token classes.', /\.(tsx?|jsx?)$/],
  [/\b(?:bg|text|border|ring|fill|stroke|from|to|via|shadow|outline|decoration)-\[(?:#|rgb|hsl)/g, 'E', 'Tailwind arbitrary colour. Use theme colours only.', /\.(tsx?|jsx?|html)$/],
  [/\b(?:text|leading|tracking|rounded|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|w|h|min-h|min-w|max-w)-\[\d/g, 'W', 'Tailwind arbitrary size. Prefer token scale; justify in a comment if unavoidable.', /\.(tsx?|jsx?|html)$/],
  [/from\s+['"](lucide-react|react-icons[^'"]*|@heroicons\/[^'"]+|@mui\/icons-material[^'"]*|@tabler\/icons[^'"]*|phosphor-react|@phosphor-icons\/[^'"]+|react-feather)['"]/g, 'E', 'Third-party icon library. Use assets/icons (Icon component) only.', /\.(tsx?|jsx?)$/],
  [/<img[^>]+src=["'{`]\s*['"`]?https?:\/\//g, 'E', 'External image URL. All images must come from /assets (photos manifest, tool-logos, illustrations, brand).', /\.(tsx?|jsx?|html)$/],
  [/url\(\s*['"]?https?:\/\//g, 'E', 'External asset URL in CSS.', /\.(css|scss|tsx?)$/],
  [/fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit/g, 'E', 'Remote font service. Fonts are self-hosted from design/fonts.', /./],
  [/\b(best|leading|world'?s|number one|#1|top-rated|industry standard|revolutionary|ultimate)\b/gi, 'W', 'Superlative in UI copy (doc 07 §4.7). Rephrase plainly unless it is a quote with a source.', /\.(json|mdx?|tsx?)$/],
  [/!important/g, 'W', '!important overrides tokens/components. Avoid.', /\.(css|scss)$/],
];

const files = walk(SRC);
for (const f of files) {
  const rel = f.replace(/\\/g, '/');
  if (/(^|\/)(design\/tokens|assets|public\/assets|generated)\//.test(rel)) continue;
  if (/\.(png|jpe?g|webp|avif|svg|woff2?|ico)$/.test(f)) continue;
  const txt = fs.readFileSync(f, 'utf8');
  const lines = txt.split('\n');
  for (const [re, lvl, msg, filt] of RULES) {
    if (!filt.test(f)) continue;
    lines.forEach((ln, i) => {
      if (/design-lint-ignore/.test(ln)) return;
      re.lastIndex = 0;
      if (re.test(ln)) (lvl === 'E' ? E : W)(rel, i + 1, msg);
    });
  }
  // Photo slugs must exist in manifest
  for (const m of txt.matchAll(/(?:slug=|data-da-slug=)["'{]?['"]([a-z0-9-]+)['"]/g)) {
    if (!manifest.photos[m[1]]) E(rel, txt.slice(0, m.index).split('\n').length, `Photo slug "${m[1]}" is not in assets/photos/manifest.json`);
  }
  // Icon names must exist
  for (const m of txt.matchAll(/<Icon[^>]*\bname=["']([a-z0-9-]+)["']/g)) {
    if (iconNames.length && !iconNames.includes(m[1])) E(rel, txt.slice(0, m.index).split('\n').length, `Icon "${m[1]}" is not in assets/icons/outline`);
  }
  // Inline SVG paths outside the icon module
  if (/\.(tsx|jsx)$/.test(f) && /<path\s+d=/.test(txt) && !/icons?\//.test(rel)) W(rel, 1, 'Inline SVG path. Add the icon to assets/icons instead.');
}

// Generated token files must match tokens.json
try {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tok-'));
  fs.copyFileSync(path.join(DESIGN, 'tokens/tokens.json'), path.join(tmp, 'tokens.json'));
  const here = path.dirname(new URL(import.meta.url).pathname);
  execFileSync(process.execPath, [path.join(here, 'build-tokens.mjs'), tmp], { stdio: 'ignore' });
  for (const g of ['tokens.css', 'tailwind-theme.css', 'tokens.ts']) {
    const a = fs.readFileSync(path.join(tmp, g), 'utf8');
    const p = path.join(DESIGN, 'tokens', g);
    if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== a) E(p, 1, 'Generated token file is out of date or hand-edited. Run: node tools/build-tokens.mjs');
  }
} catch (e) { W(DESIGN, 1, 'Could not verify generated tokens: ' + e.message); }

for (const w of warns) console.log('WARN  ' + w);
for (const e of errors) console.log('ERROR ' + e);
console.log(`check-design: ${files.length} files · ${errors.length} errors · ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
