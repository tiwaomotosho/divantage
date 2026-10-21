// Local preview that mimics the Vercel setup: static files with clean URLs, the SPA fallback and api/v1 functions.
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve("build/client");
const port = Number(process.env.PORT ?? 4173);
const fns: Record<string, any> = {
  "/api/v1/corrections": await import("../api/v1/corrections"),
  "/api/v1/events": await import("../api/v1/events"),
  "/api/v1/health": await import("../api/v1/health"),
};

function file(p: string) {
  const full = path.join(ROOT, decodeURIComponent(p));
  if (!full.startsWith(ROOT)) return null;
  for (const c of [full, path.join(full, "index.html"), full + ".html"]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const fn = fns[url.pathname];
    if (fn) {
      const h = fn[req.method];
      return h ? h(req) : new Response("Method not allowed", { status: 405 });
    }
    const f = file(url.pathname) ?? path.join(ROOT, "__spa-fallback.html");
    return new Response(Bun.file(f));
  },
});
console.log(`Preview on http://localhost:${port}`);
