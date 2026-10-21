// Small presentational components from 06 §6 and §11.
import { Link } from "react-router";
import { ArrowRight, Check, ExternalLink, Info, AlertTriangle, CircleCheck, OctagonAlert, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { formatDate } from "~/lib/format";
import { flag } from "../lib/build";
import { openSuggest } from "./SuggestSheet";

export interface ToolRowData {
  slug: string;
  name: string;
  hue: string;
  pricing: string | null;
  starts: boolean;
  guide: boolean;
}

export function Monogram({ name, hue, size = 40 }: { name: string; hue: string; size?: 32 | 40 | 56 }) {
  return (
    <span className={`monogram monogram-${size}`} data-hue={hue} aria-hidden="true">
      {name.replace(/^[^A-Za-z0-9]+/, "").charAt(0).toUpperCase()}
    </span>
  );
}

export function PricingBadge({ label, starts, checked }: { label: string | null; starts?: boolean; checked?: string }) {
  if (!label) return <span className="badge badge-ghost">Profile coming soon</span>;
  const unknown = label === "Price not confirmed";
  return (
    <span className={`badge ${starts ? "badge-starts" : unknown ? "badge-unknown" : "badge-neutral"}`}>
      {starts && <Check size={14} aria-hidden="true" />}
      {label}
      {checked && <span className="badge-sub"> · checked {formatDate(checked)}</span>}
    </span>
  );
}

export function ToolRow({ t }: { t: ToolRowData }) {
  return (
    <li className="tool-row">
      <Monogram name={t.name} hue={t.hue} size={32} />
      <Link to={`/tools/${t.slug}`} className="tool-row-name">
        {t.name}
      </Link>
      <PricingBadge label={t.pricing} starts={t.starts} />
    </li>
  );
}

export interface NeedCardProps {
  slug: string;
  label: string;
  description: string;
  family: string;
  tools: ToolRowData[];
  lensTool: { slug: string; name: string } | null;
  more: number;
}

export function NeedCard({
  n,
  identity,
  compact,
}: {
  n: NeedCardProps;
  identity?: { slug: string; plural: string };
  compact?: boolean;
}) {
  return (
    <article className={`need-card${compact ? " need-card-compact" : ""}`}>
      <h3 className="need-card-title">
        <Link to={`/needs/${n.slug}`}>{n.label}</Link>
      </h3>
      {!compact && <p className="need-card-desc">{n.description}</p>}
      <ul className="tool-rows">
        {n.tools.map((t) => (
          <ToolRow key={t.slug} t={t} />
        ))}
      </ul>
      <div className="need-card-foot">
        {identity && n.lensTool && (
          <Link className="link-strong" to={`/for/${identity.slug}/${n.lensTool.slug}`}>
            How {identity.plural} use {n.lensTool.name} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
        {n.more > 0 && (
          <Link className="link-quiet" to={`/needs/${n.slug}`}>
            See all {n.tools.length + n.more} tools
          </Link>
        )}
      </div>
    </article>
  );
}

export function IdentityChip({ slug, label, hue }: { slug: string; label: string; hue?: string }) {
  return (
    <Link to={`/for/${slug}`} className="identity-chip">
      {hue && <span className="dot" data-hue={hue} aria-hidden="true" />}
      {label}
    </Link>
  );
}

export function Breadcrumb({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className={i > 0 && i < items.length - 1 ? "crumb-mid" : undefined}>
            {it.to && i < items.length - 1 ? <Link to={it.to}>{it.label}</Link> : <span aria-current={i === items.length - 1 ? "page" : undefined}>{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const TONE_ICON = { info: Info, warning: AlertTriangle, success: CircleCheck, error: OctagonAlert };
export function Callout({ tone = "info", title, children }: { tone?: keyof typeof TONE_ICON; title?: string; children: ReactNode }) {
  const Icon = TONE_ICON[tone];
  const Tag = tone === "warning" ? "aside" : "div";
  return (
    <Tag className={`callout callout-${tone}`} aria-label={tone === "warning" ? "Warning" : undefined}>
      <Icon size={20} aria-hidden="true" className="callout-icon" />
      <div>
        {title && <p className="callout-title">{title}</p>}
        <div className="callout-body">{children}</div>
      </div>
    </Tag>
  );
}

export function ExternalA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
      {children}
      <ExternalLink size={16} aria-hidden="true" />
      <span className="sr-only"> (official site, opens in a new tab)</span>
    </a>
  );
}

export function ValidationLabel({ status }: { status?: string }) {
  const s = status ?? "pending";
  return <span className="badge badge-neutral">Expert review: {s === "validated" ? "reviewed" : s}</span>;
}

export function SuggestButton({ kind, recordId }: { kind?: string; recordId?: string }) {
  if (!flag("suggest_edit")) return null;
  return (
    <a
      className="btn btn-tertiary"
      href="/suggest"
      onClick={(e) => {
        e.preventDefault();
        openSuggest({ kind, recordId });
      }}
    >
      <Pencil size={16} aria-hidden="true" /> Suggest an edit
    </a>
  );
}

export function TrustFooter({
  validation,
  reviewed,
  sources,
  kind,
  recordId,
  note,
}: {
  validation?: string;
  reviewed?: string;
  sources?: { id: string; title: string; url: string; publisher?: string; checked_at?: string }[];
  kind?: string;
  recordId?: string;
  note?: string;
}) {
  return (
    <section className="trust-footer" aria-label="About this information">
      <div className="trust-meta">
        <ValidationLabel status={validation} />
        {reviewed && <span className="meta">Last reviewed {formatDate(reviewed)}</span>}
      </div>
      <p className="meta">
        {note ??
          "Drafted with AI assistance and published under the owner's MVP approval. Check prices and features on the official site before you rely on them."}
      </p>
      {sources && sources.length > 0 && (
        <details className="sources" open>
          <summary>Sources ({sources.length})</summary>
          <ol>
            {sources.map((s) => (
              <li key={s.id} id={`src-${s.id}`}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
                {s.publisher && <span className="meta"> · {s.publisher}</span>}
                {s.checked_at && <span className="meta"> · checked {formatDate(s.checked_at)}</span>}
              </li>
            ))}
          </ol>
        </details>
      )}
      <div className="trust-actions">
        <SuggestButton kind={kind} recordId={recordId} />
        <Link className="btn btn-tertiary" to={`/report${recordId ? `?record=${recordId}` : ""}`}>
          Report an issue
        </Link>
      </div>
    </section>
  );
}

export function Section({ title, id, children, lead }: { title: string; id?: string; children: ReactNode; lead?: ReactNode }) {
  return (
    <section className="section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </section>
  );
}

export function ChipList({ items }: { items: { to: string; label: string }[] }) {
  return (
    <ul className="chip-list">
      {items.map((i) => (
        <li key={i.to}>
          <Link to={i.to} className="chip">
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function WhoUses({ groups, tool }: { groups: { sector: string; label: string; count: number; identities: { slug: string; label: string; hue: string }[] }[]; tool?: string }) {
  if (!groups.length) return <p className="meta">No professions list {tool ?? "this"} in their toolkit yet.</p>;
  return (
    <div className="who-uses">
      {groups.map((g, i) => (
        <details key={g.sector} open={i < 2}>
          <summary>
            {g.label} <span className="meta">({g.count.toLocaleString("en-GB")})</span>
          </summary>
          <ul className="chip-list">
            {g.identities.map((x) => (
              <li key={x.slug}>
                <IdentityChip {...x} />
              </li>
            ))}
            {g.count > g.identities.length && (
              <li>
                <Link className="chip chip-more" to={`/sectors/${g.sector}`}>
                  See all {g.count.toLocaleString("en-GB")}
                </Link>
              </li>
            )}
          </ul>
        </details>
      ))}
    </div>
  );
}

export function PageHeader({ eyebrow, title, lead, children }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </header>
  );
}

/** Shown when a route's feature flag is off (the route behaves as S24 Not found). */
export function FlagOff() {
  return (
    <div className="container narrow">
      <div className="empty-state">
        <h1>We couldn't find that page</h1>
        <p>The link may be old, or the page may have moved.</p>
        <Link className="btn btn-primary" to="/">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
