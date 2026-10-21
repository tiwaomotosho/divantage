// S41 Helper panel: a pill on every page while a helper is active, expanding to a sheet (phones) or popover (desktop).
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { X, ChevronUp } from "lucide-react";
import { flag, listedHelpers } from "../lib/build";
import { fetchJson } from "../lib/indexes";
import { helperActions, storageAvailable, useHelperState, type HelperProgress } from "../lib/store";

export interface PanelHelper {
  slug: string;
  title: string;
  stages: { n: number; title: string; goal: string; done: number; steps: { tool: string; name: string; what: string; first_win: string }[] }[];
}

export function helperPosition(h: PanelHelper, p: HelperProgress | undefined) {
  const ticks = p?.ticks ?? {};
  const opened = p?.opened ?? {};
  const stageDone = (s: PanelHelper["stages"][number]) => Array.from({ length: s.done }, (_, i) => ticks[`${s.n}-${i}`]).every(Boolean);
  const doneCount = h.stages.reduce((a, s) => a + Array.from({ length: s.done }, (_, i) => ticks[`${s.n}-${i}`]).filter(Boolean).length, 0);
  const total = h.stages.reduce((a, s) => a + s.done, 0);
  const stage = h.stages.find((s) => !stageDone(s)) ?? null;
  const next = stage ? (stage.steps.find((st) => !opened[st.tool]) ?? null) : null;
  return { stage, next, doneCount, total, finished: !stage };
}

export function useHelperDefs(enabled: boolean) {
  const [defs, setDefs] = useState<PanelHelper[] | null>(null);
  useEffect(() => {
    if (!enabled || defs) return;
    fetchJson<PanelHelper[]>("/data/helpers.json").then(setDefs, () => setDefs([]));
  }, [enabled, defs]);
  return defs;
}

function Ring({ value }: { value: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="ring">
      <circle cx="12" cy="12" r={r} className="ring-track" />
      <circle cx="12" cy="12" r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - value)} transform="rotate(-90 12 12)" />
    </svg>
  );
}

export function HelperPanel() {
  const state = useHelperState();
  const loc = useLocation();
  const navigate = useNavigate();
  const active = state?.active && !state.paused ? state.active : null;
  const defs = useHelperDefs(Boolean(active));
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) desktop ? d.show() : d.showModal();
    if (!open && d.open) d.close();
  }, [open, desktop]);

  const visible = flag("helper_panel") && active && storageAvailable() && !loc.pathname.startsWith(`/helpers/${active}`) && !loc.pathname.startsWith("/report");
  useEffect(() => {
    document.documentElement.toggleAttribute("data-helper-pill", Boolean(visible));
  }, [visible]);
  if (!visible || !defs) return null;

  const h = defs.find((x) => x.slug === active);
  if (!h || !listedHelpers.includes(active!)) {
    return (
      <div className="helper-pill-wrap">
        <div className="helper-pill helper-pill-static">
          <span>This helper has moved. </span>
          <Link to="/helpers" onClick={() => helperActions.stop()}>
            Choose another helper
          </Link>
        </div>
      </div>
    );
  }
  const pos = helperPosition(h, state!.progress[h.slug]);
  const short = h.title.replace(/^The /, "").replace(/ Helper$/, "");
  const pillText = pos.finished
    ? `${short} · Finished`
    : `${short} · Stage ${pos.stage!.n} of ${h.stages.length}${pos.next ? ` · Next: ${pos.next.name}` : ""}`;
  const close = () => {
    setOpen(false);
    pillRef.current?.focus();
  };

  return (
    <div className="helper-pill-wrap">
      <div className="helper-pill">
        <button ref={pillRef} type="button" className="helper-pill-main" aria-expanded={open} aria-controls="helper-sheet" onClick={() => setOpen(!open)}>
          <Ring value={pos.total ? pos.doneCount / pos.total : 0} />
          <span className="helper-pill-text">{pillText}</span>
          <ChevronUp size={18} aria-hidden="true" className={open ? "rot" : ""} />
        </button>
        <button type="button" className="icon-btn helper-pill-x" aria-label={`Pause the ${short} helper`} onClick={() => helperActions.pause()}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <dialog ref={dialogRef} id="helper-sheet" className={`helper-sheet${desktop ? " is-popover" : ""}`} aria-label={h.title} onClose={() => setOpen(false)} onCancel={close}>
        <div className="sheet-head">
          <h2 className="h4">{h.title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={close}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {pos.finished ? (
          <p>You've finished the {short} helper.</p>
        ) : (
          <>
            <p className="eyebrow">
              Stage {pos.stage!.n} of {h.stages.length}: {pos.stage!.title}
            </p>
            <p className="meta">{pos.stage!.goal}</p>
            {pos.next ? (
              <div className="next-step">
                <p className="label">Next step</p>
                <p className="h4">{pos.next.name}</p>
                <p>{pos.next.what}</p>
                <p className="meta">First win: {pos.next.first_win}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    helperActions.opened(h.slug, pos.next!.tool);
                    navigate(`/tools/${pos.next!.tool}`);
                  }}
                >
                  Open {pos.next.name}
                </button>
              </div>
            ) : (
              <p>
                Tick what you've finished. <Link to={`/helpers/${h.slug}#stage-${pos.stage!.n}`}>Go to the checklist</Link>
              </p>
            )}
          </>
        )}
        <div className="sheet-actions">
          <Link className="btn btn-secondary" to={`/helpers/${h.slug}`}>
            See all stages
          </Link>
          <Link className="btn btn-tertiary" to="/helpers">
            Switch helper
          </Link>
          <button type="button" className="btn btn-tertiary" onClick={() => helperActions.pause()}>
            Pause
          </button>
          <button
            type="button"
            className="btn btn-tertiary"
            onClick={() => {
              if (confirm("Clear all helper and roadmap progress saved on this device?")) helperActions.clearAll();
            }}
          >
            Clear my progress
          </button>
        </div>
      </dialog>
    </div>
  );
}
