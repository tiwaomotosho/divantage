#!/usr/bin/env node
// Generates design/tokens/tokens.css, tokens.ts and tailwind-theme.css from design/tokens/tokens.json.
// Usage (from patch or repo root):  node tools/build-tokens.mjs [tokensDir]
// The generated files carry a GENERATED header; tools/check-design.mjs fails if they drift from tokens.json.
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || 'design/tokens';
const t = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'));
const HDR = '/* GENERATED from tokens.json by tools/build-tokens.mjs. Do not edit by hand. */\n';
const v = (k, val) => `  --da-${k}: ${val};`;

function colorBlock(mode) {
  const out = Object.entries(t.color[mode]).map(([k, val]) => v(`color-${k}`, val));
  for (const [h, m] of Object.entries(t['category-hue'])) {
    out.push(v(`hue-${h}-bg`, m[mode][0]), v(`hue-${h}-fg`, m[mode][1]));
  }
  for (const [k, val] of Object.entries(t.shadow[mode])) out.push(v(`shadow-${k}`, val));
  return out.join('\n');
}

const base = [];
for (const [k, val] of Object.entries(t.space)) base.push(v(`space-${k}`, val));
for (const [k, val] of Object.entries(t.font)) base.push(v(`font-${k}`, val));
for (const [name, s] of Object.entries(t.type)) {
  base.push(v(`type-${name}-size`, s.size), v(`type-${name}-line`, s.line));
  if (s.tracking) base.push(v(`type-${name}-tracking`, s.tracking));
  base.push(v(`type-${name}-family`, `var(--da-font-family-${s.family})`));
  const w = t.font[`weight-${s.weight}`] || s.weight;
  base.push(v(`type-${name}-weight`, w));
}
for (const grp of ['layout', 'radius', 'border', 'icon', 'z', 'motion', 'aspect', 'breakpoint']) {
  for (const [k, val] of Object.entries(t[grp] || {})) if (!k.startsWith('$')) base.push(v(`${grp}-${k}`, val));
}

const css = `${HDR}/* version ${t.version} */
:root {
  color-scheme: light;
${base.join('\n')}
${colorBlock('light')}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${colorBlock('dark').replace(/^/gm, '  ')}
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
${colorBlock('dark')}
}
@media (prefers-reduced-motion: reduce) {
  :root { --da-motion-duration-fast: 0ms; --da-motion-duration-base: 0ms; --da-motion-duration-slow: 0ms; --da-motion-duration-layout: 0ms; }
}
`;
fs.writeFileSync(path.join(dir, 'tokens.css'), css);

// Tailwind v4 theme (maps utilities to the same variables; no new values)
const tw = [`${HDR}@theme inline {`];
for (const k of Object.keys(t.color.light)) tw.push(`  --color-${k}: var(--da-color-${k});`);
for (const h of Object.keys(t['category-hue'])) tw.push(`  --color-hue-${h}-bg: var(--da-hue-${h}-bg);`, `  --color-hue-${h}-fg: var(--da-hue-${h}-fg);`);
for (const k of Object.keys(t.radius)) tw.push(`  --radius-${k}: var(--da-radius-${k});`);
for (const k of Object.keys(t.space)) tw.push(`  --spacing-${k}: var(--da-space-${k});`);
tw.push('  --font-display: var(--da-font-family-display);', '  --font-sans: var(--da-font-family-text);', '  --font-mono: var(--da-font-family-mono);');
for (const [k, val] of Object.entries(t.breakpoint)) tw.push(`  --breakpoint-${k}: ${val};`);
tw.push('}');
fs.writeFileSync(path.join(dir, 'tailwind-theme.css'), tw.join('\n') + '\n');

// TypeScript export
fs.writeFileSync(path.join(dir, 'tokens.ts'),
  `// GENERATED from tokens.json by tools/build-tokens.mjs. Do not edit by hand.\nexport const tokens = ${JSON.stringify(t, null, 2)} as const;\nexport type ColorToken = keyof typeof tokens.color.light;\n`);
console.log(`tokens ${t.version}: tokens.css, tailwind-theme.css, tokens.ts written to ${dir}`);
