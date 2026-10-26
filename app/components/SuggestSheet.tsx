// S36 Suggest an edit (reference 20-suggest-edit). Sheet on every page; /suggest works without JS.
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { flag } from "../lib/build";
import { retentionActions, sessionGet, sessionSet, useHydrated } from "../lib/store";
import { Icon, Sheet } from "./da";

export const REASONS: Record<string, { label: string; icon?: string; type: string; source?: boolean }> = {
  price: { label: "Price changed", icon: "dollar", type: "pricing", source: true },
  country: { label: "Not in my country", type: "availability", source: true },
  link: { label: "Broken link", type: "broken_link" },
  closed: { label: "Renamed or shut down", type: "tool_discontinued", source: true },
  feature: { label: "Feature is wrong", type: "feature", source: true },
  need: { label: "My work isn't described right", type: "suggest_need" },
  role: { label: "My job isn't listed", type: "suggest_identity" },
  path: { label: "Learning path is wrong", type: "roadmap_feedback" },
  rolepath: { label: "Write a path for my job", type: "role_path_request" },
  tool: { label: "A tool is missing", type: "suggest_tool" },
  helper: { label: "I want a helper for my work", type: "suggest_helper" },
  a11y: { label: "Accessibility problem", type: "accessibility" },
  other: { label: "Something else", type: "other" },
};
const BY_KIND: Record<string, string[]> = {
  tool: ["price", "country", "link", "closed", "feature", "other"],
  identity: ["need", "role", "tool", "other"],
  path: ["path", "rolepath", "other"],
  helper: ["helper", "path", "tool", "other"],
  default: ["other", "tool", "role", "need", "link", "a11y"],
};

export function kindFromPath(p: string): string {
  if (/^\/tools\/[^/]+$/.test(p)) return "tool";
  if (/^\/tools\/[^/]+\/(roadmap|for\/)/.test(p)) return "path";
  if (/^\/for\/[^/]+$/.test(p)) return "identity";
  if (/^\/helpers\//.test(p)) return "helper";
  return "default";
}

export function openSuggest(detail: { reason?: string; on?: string; recordId?: string } = {}) {
  window.dispatchEvent(new CustomEvent("da:suggest", { detail }));
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; ref: string } | { kind: "error"; message: string };
const DRAFT = "da.suggest.draft";

export function SuggestForm({ page, kind, reason, on, recordId, onDone }: { page: string; kind: string; reason?: string; on?: string; recordId?: string; onDone?: () => void }) {
  const keys = BY_KIND[kind] ?? BY_KIND.default;
  const [r, setR] = useState(reason && REASONS[reason] ? reason : keys[0]);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState(false);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [err, setErr] = useState("");
  const list = [...new Set([...(reason && REASONS[reason] ? [reason] : []), ...keys])];
  useEffect(() => {
    const d = sessionGet(DRAFT);
    if (d)
      try {
        const j = JSON.parse(d);
        if (j.page === page) {
          setText(j.text ?? "");
          setLink(j.link ?? "");
        }
      } catch {
        /* ignore */
      }
  }, [page]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const def = REASONS[r];
    if (!text.trim()) return setErr("Tell us what's wrong or missing.");
    if (def.source && !link.trim()) return setErr("Add a link to a source. Use the official page if you can.");
    const url = link.trim() && !/^https?:\/\//.test(link.trim()) ? `https://${link.trim()}` : link.trim();
    if (url && !/^https:\/\//.test(url)) return setErr("The link must start with https://");
    setErr("");
    setStatus({ kind: "sending" });
    const body: Record<string, unknown> = { page_url: page, issue_type: def.type, description: text.trim(), turnstile_token: "no-widget", website: "" };
    if (url) body.supporting_url = url;
    if (email) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) {
        setStatus({ kind: "idle" });
        return setErr("Add the email address for the reply, or untick the box.");
      }
      body.contact_email = address.trim();
      body.consent_contact = true;
    }
    if (recordId) body.record_id = recordId;
    try {
      const res = await fetch("/api/v1/corrections", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 429) return setStatus({ kind: "error", message: "You've sent a few suggestions just now. Please try again in a few minutes." });
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json().catch(() => ({}));
      sessionSet(DRAFT, null);
      if (j.reference) retentionActions.suggestionSent(j.reference, on ?? page, def.type);
      setStatus({ kind: "done", ref: j.reference ?? "received" });
    } catch {
      sessionSet(DRAFT, JSON.stringify({ page, text, link }));
      setStatus({ kind: "error", message: "We couldn't send this. Your text is saved on this device; try again." });
    }
  }

  if (status.kind === "done")
    return (
      <div role="status" style={{ textAlign: "center" }}>
        <p className="t-h3" style={{ marginTop: 16 }}>
          Thank you
        </p>
        <p className="t-sm mu" style={{ marginTop: 6 }}>
          Reference <b className="t-mono">{status.ref}</b>. A person reviews every suggestion, usually within 7 days.
        </p>
        <div className="col g10" style={{ marginTop: 16 }}>
          {status.ref !== "received" && (
            <Link className="btn p blk" to={`/suggestions/${status.ref}`} onClick={onDone}>
              Follow its status
            </Link>
          )}
          <button type="button" className="btn s blk" onClick={() => setStatus({ kind: "idle" })}>
            Suggest another
          </button>
          {onDone && (
            <button type="button" className="btn g blk" onClick={onDone}>
              Close
            </button>
          )}
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} method="post" action="/api/v1/corrections" noValidate>
      <input type="hidden" name="page_url" value={page} />
      <input type="hidden" name="issue_type" value={REASONS[r].type} />
      {on && (
        <div className="t-sm mu">
          On: <b>{on}</b> · {REASONS[r].label}
        </div>
      )}
      <div className="t-label" style={{ marginTop: 16 }}>
        What's wrong?
      </div>
      <div className="row g8 wrapf" style={{ marginTop: 8 }} role="radiogroup" aria-label="What's wrong?">
        {list.map((k) => (
          <button key={k} type="button" role="radio" aria-checked={k === r} className={`chip ${k === r ? "sel" : ""}`} onClick={() => setR(k)}>
            {REASONS[k].icon && <Icon name={REASONS[k].icon!} />} {REASONS[k].label}
          </button>
        ))}
      </div>
      <label className="t-label" htmlFor="sg-text" style={{ display: "block", marginTop: 16 }}>
        Tell us more
      </label>
      <div className="input" style={{ marginTop: 8, alignItems: "flex-start", padding: 14, minHeight: 96 }}>
        <textarea id="sg-text" name="description" className="t-sm" value={text} maxLength={2000} rows={3} onChange={(e) => setText(e.target.value)} style={{ all: "unset", flex: 1, color: "var(--da-color-ink)", minHeight: 66, whiteSpace: "pre-wrap" }} aria-invalid={Boolean(err) && !text.trim()} />
      </div>
      <label className="t-label" htmlFor="sg-link" style={{ display: "block", marginTop: 14 }}>
        Link {REASONS[r].source ? "(needed for this change)" : "(optional)"}
      </label>
      <label className="input" style={{ marginTop: 8 }}>
        <Icon name="globe" />
        <input id="sg-link" name="supporting_url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Use the official page if you can" inputMode="url" />
      </label>
      {flag("suggest_email") && (
        <div className="row g10 t-sm" style={{ marginTop: 12 }}>
          <button type="button" className="chk" role="checkbox" aria-checked={email} aria-label="Email me when it's reviewed" onClick={() => setEmail(!email)}>
            {email && <Icon name="check" />}
          </button>
          <span className="mu">Email me when it's reviewed (we keep your email 90 days)</span>
        </div>
      )}
      {flag("suggest_email") && email && (
        <label className="input" style={{ marginTop: 8 }}>
          <Icon name="mail" />
          <input type="email" name="contact_email" placeholder="you@example.com" aria-label="Email for the reply" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
      )}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" hidden />
      {err && (
        <div className="banner err" role="alert" style={{ marginTop: 12 }}>
          <Icon name="alert" />
          <span>{err}</span>
        </div>
      )}
      {status.kind === "error" && (
        <div className="banner err" role="alert" style={{ marginTop: 12 }}>
          <Icon name="alert" />
          <span>{status.message}</span>
        </div>
      )}
      <p className="t-xs su" style={{ marginTop: 12 }}>
        A person reviews every suggestion. By sending this you agree it can be published under CC BY 4.0.
      </p>
      <button type="submit" className="btn p blk lg" style={{ marginTop: 12 }} disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send suggestion"}
      </button>
    </form>
  );
}

export function SuggestSheet() {
  const [open, setOpen] = useState<{ reason?: string; on?: string; recordId?: string } | null>(null);
  const loc = useLocation();
  const [params, setParams] = useSearchParams();
  const hydrated = useHydrated();
  useEffect(() => {
    const on = (e: Event) => setOpen((e as CustomEvent).detail ?? {});
    window.addEventListener("da:suggest", on);
    return () => window.removeEventListener("da:suggest", on);
  }, []);
  useEffect(() => {
    const s = params.get("suggest");
    if (hydrated && s) setOpen({ reason: s });
  }, [hydrated, params]);
  useEffect(() => setOpen(null), [loc.pathname]);
  const close = () => {
    setOpen(null);
    if (params.get("suggest")) {
      const p = new URLSearchParams(params);
      p.delete("suggest");
      setParams(p, { replace: true, preventScrollReset: true });
    }
  };
  if (!flag("suggest_edit")) return null;
  const on = open?.on ?? (typeof document !== "undefined" ? document.querySelector("h1")?.textContent ?? undefined : undefined);
  return (
    <Sheet open={Boolean(open)} onClose={close} labelledBy="sg" da="suggest-sheet">
      <div className="row sb" style={{ marginTop: 12 }}>
        <h2 id="sg" className="t-h3">
          Suggest an edit
        </h2>
        <button type="button" className="ib" aria-label="Close" onClick={close}>
          <Icon name="x" />
        </button>
      </div>
      {open && <SuggestForm page={loc.pathname} kind={kindFromPath(loc.pathname)} reason={open.reason} on={on} recordId={open.recordId} onDone={close} />}
    </Sheet>
  );
}
