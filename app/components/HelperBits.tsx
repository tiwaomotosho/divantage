// HelperCard, RouteRail, StepRow, DoneChecklist, ProgressBar (06 §12.3).
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";

export interface HelperCardData {
  slug: string;
  title: string;
  short: string;
  promise: string;
  stages: number;
  tools: number;
  tint: string;
}

export function HelperCard({ h, actions }: { h: HelperCardData; actions?: React.ReactNode }) {
  return (
    <article className="helper-card" data-tint={h.tint}>
      <h3 className="helper-card-title">
        <Link to={`/helpers/${h.slug}`}>{h.short}</Link>
      </h3>
      <p className="helper-card-promise">{h.promise}</p>
      <p className="meta-ink">
        {h.stages} stages · {h.tools} tools
      </p>
      {actions ?? (
        <span className="round-arrow" aria-hidden="true">
          <ArrowRight size={22} />
        </span>
      )}
    </article>
  );
}

export function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  // Set through the CSSOM (allowed by the CSP), not a style attribute (blocked by style-src 'self').
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (fill.current) fill.current.style.transform = `scaleX(${pct / 100})`;
  }, [pct]);
  return (
    <div className="progress">
      <div className="progress-text">
        <span>{pct}%</span>
        <span className="meta">
          {done} of {total}
        </span>
      </div>
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="progress-fill" ref={fill} />
      </div>
    </div>
  );
}

export function RailNode({ n, done }: { n: number; done: boolean }) {
  return (
    <span className={`rail-node${done ? " is-done" : ""}`} aria-hidden="true">
      {done ? <Check size={18} /> : n}
    </span>
  );
}
