// POST /api/v1/corrections — Suggest an edit (S36) and Report an issue (S18). Contract: schemas/correction-request.schema.json.
// Verifies Turnstile when TURNSTILE_SECRET_KEY is set; files a GitHub issue in CORRECTIONS_GITHUB_REPO when
// CORRECTIONS_GITHUB_TOKEN is set (Issues scope on the private repo only). Without them it logs and returns a reference.

const ISSUE_TYPES = new Set([
  "pricing", "availability", "broken_link", "feature", "outdated_steps", "accessibility", "other",
  "suggest_tool", "suggest_identity", "suggest_need", "suggest_helper", "roadmap_feedback", "tool_discontinued",
]);
const NEEDS_SOURCE = new Set(["pricing", "feature", "availability", "tool_discontinued"]);
const RECORD_RE = /^(tool|task|res|pb|cmp|id|need|rm|lens|skill)_[a-z0-9_]+$/;

// Best-effort rate limit per instance (5 per 10 minutes per client). A shared store is an open question (docs/open-questions.md).
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(key, list);
  return list.length > 5;
}

function reference() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const r = Array.from(crypto.getRandomValues(new Uint8Array(2)), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `DA-${d}-${r}`;
}

type Body = Record<string, unknown>;

function validate(b: Body, siteUrl: string): string[] {
  const errs: string[] = [];
  const str = (k: string, max: number) => b[k] === undefined || (typeof b[k] === "string" && (b[k] as string).length <= max);
  const page = b.page_url;
  if (typeof page !== "string" || page.length > 500 || !(page.startsWith("/") || page.startsWith(siteUrl))) errs.push("page_url");
  if (typeof b.issue_type !== "string" || !ISSUE_TYPES.has(b.issue_type)) errs.push("issue_type");
  if (b.record_id !== undefined && (typeof b.record_id !== "string" || !RECORD_RE.test(b.record_id))) errs.push("record_id");
  if (!str("description", 2000) || !str("proposed_text", 2000)) errs.push("description");
  if (b.supporting_url !== undefined && b.supporting_url !== "" && (typeof b.supporting_url !== "string" || !/^https:\/\//.test(b.supporting_url) || b.supporting_url.length > 2048)) errs.push("supporting_url");
  if (NEEDS_SOURCE.has(String(b.issue_type)) && !b.supporting_url) errs.push("supporting_url");
  if (b.credit_name !== undefined && b.credit_name !== "") {
    if (typeof b.credit_name !== "string" || b.credit_name.length > 60 || /[<>@\n]/.test(b.credit_name)) errs.push("credit_name");
    if (b.credit_consent !== true) errs.push("credit_consent");
  }
  if (b.contact_email !== undefined && b.consent_contact !== true) errs.push("consent_contact");
  return errs;
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const j = (await res.json().catch(() => ({}))) as { success?: boolean };
  return j.success === true;
}

async function fileIssue(ref: string, b: Body) {
  const token = process.env.CORRECTIONS_GITHUB_TOKEN;
  const repo = process.env.CORRECTIONS_GITHUB_REPO;
  if (!token || !repo) {
    console.log("correction (no GitHub token configured)", ref, JSON.stringify({ ...b, contact_email: b.contact_email ? "[redacted]" : undefined }));
    return true;
  }
  const lines = [
    `**Reference:** ${ref}`,
    `**Type:** ${b.issue_type}`,
    `**Page:** ${b.page_url}`,
    b.record_id ? `**Record:** ${b.record_id}` : "",
    b.conflict_of_interest ? "**Conflict of interest:** submitter works for or with the tool's company" : "",
    "",
    "### What's wrong or missing",
    String(b.description ?? ""),
    b.proposed_text ? `\n### What it should say\n${b.proposed_text}` : "",
    b.supporting_url ? `\n### Source\n${b.supporting_url}` : "",
    b.credit_name ? `\n**Credit (consented):** ${b.credit_name}` : "",
  ].filter(Boolean);
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": "digital-advantage-corrections" },
    body: JSON.stringify({ title: `[${b.issue_type}] ${String(b.page_url).slice(0, 80)} (${ref})`, body: lines.join("\n"), labels: ["correction", String(b.issue_type)] }),
  });
  return res.ok;
}

export async function POST(request: Request): Promise<Response> {
  const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  const ct = request.headers.get("content-type") ?? "";
  const isForm = !ct.includes("application/json");
  let b: Body;
  try {
    if (isForm) {
      const fd = await request.formData();
      b = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
      b.page_url ??= "/";
      b.turnstile_token ??= "no-js";
      if (b.conflict_of_interest) b.conflict_of_interest = true;
      if (b.credit_consent) b.credit_consent = true;
      for (const k of Object.keys(b)) if (b[k] === "") delete b[k];
    } else {
      b = (await request.json()) as Body;
    }
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (b.website) return Response.json({ reference: reference() }, { status: 200 }); // honeypot: pretend success
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const errs = validate(b, siteUrl);
  if (errs.length) return Response.json({ error: "invalid", fields: errs }, { status: 422 });
  if (!(await verifyTurnstile(String(b.turnstile_token ?? ""), ip))) return Response.json({ error: "bot_check_failed" }, { status: 403 });
  const ref = reference();
  const ok = await fileIssue(ref, b).catch(() => false);
  if (!ok) return Response.json({ error: "upstream" }, { status: 502 });
  if (isForm) return Response.redirect(new URL(`/report/thanks?ref=${ref}`, request.url), 303);
  return Response.json({ reference: ref }, { status: 201 });
}
