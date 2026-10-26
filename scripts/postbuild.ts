// Post-build: per-page Content-Security-Policy with SHA-256 hashes of every inline script (12, ADR-008:
// 'unsafe-inline' is not allowed). React Router prerendering emits page-specific inline scripts, so each HTML file
// gets its own <meta http-equiv="Content-Security-Policy">. Also reports Spike S-1 size measurements.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUT = path.resolve("build/client");
const t0 = Date.now();
let pages = 0;
let htmlBytes = 0;

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const decode = (v: string) => v.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const STYLE_RE = /\sstyle="([^"]*)"/g;
const sha = (v: string) => `'sha256-${crypto.createHash("sha256").update(v, "utf8").digest("base64")}'`;
const policy = (hashes: string[], styles: string[]) =>
  [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`,
    // Inline style attributes from the reference markup are allowed only by hash ('unsafe-inline' stays banned).
    styles.length ? `style-src 'self' 'unsafe-hashes' ${styles.join(" ")}` : "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

let totalAll = 0;
let jsBytes = 0;
for (const file of walk(OUT)) {
  const size = fs.statSync(file).size;
  totalAll += size;
  if (file.endsWith(".js")) jsBytes += size;
  if (!file.endsWith(".html")) continue;
  let html = fs.readFileSync(file, "utf8");
  const hashes = new Set<string>();
  for (const m of html.matchAll(SCRIPT_RE)) {
    hashes.add(`'sha256-${crypto.createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
  }
  const styles = new Set<string>();
  for (const m of html.matchAll(STYLE_RE)) styles.add(sha(decode(m[1])));
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, "");
  html = html.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="${policy([...hashes], [...styles])}">`);
  fs.writeFileSync(file, html);
  pages++;
  htmlBytes += Buffer.byteLength(html);
}

// Entry JS size (Spike S-1 measurement 2): the root entry and its static imports.
const assets = fs.readdirSync(path.join(OUT, "assets"));
const entry = assets.filter((f) => /^(entry\.client|root|manifest|chunk)-.*\.js$/.test(f));
const entryKb = entry.reduce((a, f) => a + fs.statSync(path.join(OUT, "assets", f)).size, 0) / 1024;

console.log(
  `postbuild: CSP added to ${pages} pages in ${Date.now() - t0} ms · HTML ${(htmlBytes / 1048576).toFixed(1)} MB · JS ${(jsBytes / 1024).toFixed(0)} KB (entry+shared ≈ ${entryKb.toFixed(0)} KB raw) · output ${(totalAll / 1048576).toFixed(1)} MB`,
);
