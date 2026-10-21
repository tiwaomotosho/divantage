// S36 Suggest an edit: bottom sheet on phones, side panel on desktop; /suggest works without JS.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import { X, Loader2 } from "lucide-react";
import { flag } from "../lib/build";
import { sessionGet, sessionSet } from "../lib/store";
import { Callout } from "./ui";

export const ISSUE_TYPES: Record<string, string> = {
  suggest_need: "My work isn't described right",
  suggest_identity: "My profession or role isn't listed",
  roadmap_feedback: "This course outline is wrong or missing something",
  pricing: "A price is wrong",
  feature: "A feature is wrong or missing",
  availability: "Availability or platforms are wrong",
  tool_discontinued: "This tool has been renamed, acquired or shut down",
  broken_link: "A link is broken",
  outdated_steps: "Steps are out of date",
  accessibility: "Accessibility problem",
  suggest_tool: "Suggest a tool we're missing",
  suggest_helper: "I want a helper for my work",
  other: "Something else",
};
const NEEDS_SOURCE = new Set(["pricing", "feature", "availability", "tool_discontinued"]);
const ORDER: Record<string, string[]> = {
  identity: ["suggest_need", "suggest_identity", "suggest_tool", "other"],
  tool: ["pricing", "feature", "availability", "tool_discontinued", "broken_link", "suggest_tool", "other"],
  roadmap: ["roadmap_feedback", "suggest_need", "other"],
  helper: ["suggest_helper", "roadmap_feedback", "suggest_tool", "other"],
  default: ["other", "suggest_tool", "suggest_identity", "suggest_need", "suggest_helper", "broken_link", "accessibility"],
};

export function kindFromPath(p: string): string {
  if (/^\/for\/[^/]+$/.test(p)) return "identity";
  if (/^\/tools\/[^/]+\/(roadmap|for\/)/.test(p) || /^\/for\/[^/]+\/[^/]+$/.test(p)) return "roadmap";
  if (/^\/tools\/[^/]+$/.test(p)) return "tool";
  if (/^\/helpers\//.test(p)) return "helper";
  return "default";
}

interface OpenDetail {
  kind?: string;
  recordId?: string;
  type?: string;
}
export function openSuggest(detail: OpenDetail = {}) {
  window.dispatchEvent(new CustomEvent("da:suggest", { detail }));
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; ref: string } | { kind: "error"; message: string };
const DRAFT_KEY = "da.suggest.draft";

export function SuggestForm({ page, kind, recordId, initialType, onDone }: { page: string; kind: string; recordId?: string; initialType?: string; onDone?: () => void }) {
  const types = ORDER[kind] ?? ORDER.default;
  const [type, setType] = useState(initialType && ISSUE_TYPES[initialType] ? initialType : types[0]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const orderedTypes = [...new Set([...types, ...Object.keys(ISSUE_TYPES)])];

  useEffect(() => {
    const draft = sessionGet(DRAFT_KEY);
    if (draft && formRef.current) {
      try {
        const d = JSON.parse(draft);
        if (d.page === page) for (const [k, v] of Object.entries(d)) {
          const el = formRef.current.elements.namedItem(k) as HTMLInputElement | null;
          if (el && typeof v === "string" && el.type !== "radio") el.value = v;
        }
      } catch {
        /* ignore */
      }
    }
  }, [page]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { page_url: page, issue_type: type, turnstile_token: "no-widget" };
    if (recordId) body.record_id = recordId;
    for (const k of ["description", "proposed_text", "supporting_url", "credit_name", "website"]) {
      const v = String(fd.get(k) ?? "").trim();
      if (v || k === "website") body[k] = v;
    }
    if (fd.get("conflict_of_interest")) body.conflict_of_interest = true;
    if (body.credit_name) body.credit_consent = Boolean(fd.get("credit_consent"));
    const errs: Record<string, string> = {};
    if (!body.description) errs.description = "Tell us what's wrong or missing.";
    if (NEEDS_SOURCE.has(type) && !body.supporting_url) errs.supporting_url = "Add a link to a source. The tool's official page is best.";
    if (body.supporting_url && !/^https:\/\//.test(String(body.supporting_url))) errs.supporting_url = "The link must start with https://";
    if (body.credit_name && !body.credit_consent) errs.credit_consent = "Tick the box so we can show your name, or leave the name empty.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/v1/corrections", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 429) {
        setStatus({ kind: "error", message: "You've sent a few suggestions just now. Please try again in a few minutes." });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json().catch(() => ({}));
      sessionSet(DRAFT_KEY, null);
      setStatus({ kind: "done", ref: j.reference ?? "received" });
    } catch {
      sessionSet(DRAFT_KEY, JSON.stringify({ page, ...Object.fromEntries(fd.entries()) }));
      setStatus({ kind: "error", message: "We couldn't send this. Your text is saved on this device; try again." });
    }
  }

  if (status.kind === "done") {
    return (
      <div role="status">
        <Callout tone="success" title="Thank you!">
          <p>
            Reference {status.ref}. A person reviews every suggestion, usually within a week.
          </p>
        </Callout>
        <div className="form-actions">
          <button className="btn btn-secondary" type="button" onClick={() => setStatus({ kind: "idle" })}>
            Suggest another
          </button>
          {onDone && (
            <button className="btn btn-tertiary" type="button" onClick={onDone}>
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const errList = Object.entries(errors);
  return (
    <form ref={formRef} className="form" onSubmit={submit} method="post" action="/api/v1/corrections" noValidate>
      {errList.length > 0 && (
        <div className="callout callout-error" tabIndex={-1} ref={summaryRef} role="alert">
          <div>
            <p className="callout-title">There's a problem</p>
            <ul>
              {errList.map(([k, v]) => (
                <li key={k}>
                  <a href={`#f-${k}`}>{v}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <fieldset className="field">
        <legend className="label">What kind of change?</legend>
        <div className="radio-chips">
          {orderedTypes.map((t) => (
            <label key={t} className={`radio-chip${t === type ? " is-on" : ""}`}>
              <input type="radio" name="issue_type" value={t} checked={t === type} onChange={() => setType(t)} />
              {ISSUE_TYPES[t]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="f-description" className="label">
          What's wrong or missing? (required)
        </label>
        <textarea id="f-description" name="description" maxLength={2000} rows={4} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "e-description" : undefined} />
        {errors.description && <p className="field-error" id="e-description">{errors.description}</p>}
      </div>
      <div className="field">
        <label htmlFor="f-proposed_text" className="label">
          What should it say? (optional)
        </label>
        <textarea id="f-proposed_text" name="proposed_text" maxLength={2000} rows={3} />
      </div>
      <div className="field">
        <label htmlFor="f-supporting_url" className="label">
          Link to a source {NEEDS_SOURCE.has(type) ? "(required)" : "(optional)"}
        </label>
        <p className="hint" id="h-supporting_url">The tool's official page is best.</p>
        <input id="f-supporting_url" name="supporting_url" type="url" inputMode="url" placeholder="https://" aria-invalid={Boolean(errors.supporting_url)} aria-describedby={`h-supporting_url${errors.supporting_url ? " e-supporting_url" : ""}`} />
        {errors.supporting_url && <p className="field-error" id="e-supporting_url">{errors.supporting_url}</p>}
      </div>
      {kind === "tool" && (
        <label className="check">
          <input type="checkbox" name="conflict_of_interest" /> I work for or with this tool's company
        </label>
      )}
      <div className="field">
        <label htmlFor="f-credit_name" className="label">
          How should we thank you? (optional)
        </label>
        <input id="f-credit_name" name="credit_name" maxLength={60} placeholder="e.g. Ada, Lagos" />
        <label className="check" id="f-credit_consent">
          <input type="checkbox" name="credit_consent" /> Show my name on this page and in What's new
        </label>
        {errors.credit_consent && <p className="field-error">{errors.credit_consent}</p>}
      </div>
      {flag("suggest_email") && (
        <div className="field">
          <label htmlFor="f-email" className="label">
            Email for a reply (optional)
          </label>
          <input id="f-email" name="contact_email" type="email" />
        </div>
      )}
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this empty <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="meta">By sending this you agree it can be published under CC BY 4.0.</p>
      {status.kind === "error" && <Callout tone="error">{status.message}</Callout>}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={status.kind === "sending"} aria-disabled={status.kind === "sending"}>
          {status.kind === "sending" ? (
            <>
              <Loader2 size={18} className="spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </form>
  );
}

export function SuggestSheet() {
  const [open, setOpen] = useState<OpenDetail | null>(null);
  const loc = useLocation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      triggerRef.current = document.activeElement;
      setOpen((e as CustomEvent<OpenDetail>).detail ?? {});
    };
    window.addEventListener("da:suggest", on);
    return () => window.removeEventListener("da:suggest", on);
  }, []);
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    document.documentElement.toggleAttribute("data-sheet-open", Boolean(open));
  }, [open]);
  useEffect(() => setOpen(null), [loc.pathname]);

  const close = () => {
    setOpen(null);
    (triggerRef.current as HTMLElement | null)?.focus?.();
  };
  if (!flag("suggest_edit")) return null;
  return (
    <dialog ref={dialogRef} className="sheet" aria-labelledby="suggest-title" onClose={close} onCancel={close}>
      {open && (
        <div className="sheet-inner">
          <div className="sheet-head">
            <h2 id="suggest-title">Suggest an edit</h2>
            <button className="icon-btn" type="button" onClick={close} aria-label="Close">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <p className="meta">A person reviews every suggestion. Nothing changes on the site until they approve it.</p>
          <SuggestForm page={loc.pathname} kind={open.kind ?? kindFromPath(loc.pathname)} recordId={open.recordId} initialType={open.type} onDone={close} />
        </div>
      )}
    </dialog>
  );
}
