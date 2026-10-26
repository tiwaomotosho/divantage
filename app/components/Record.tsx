// Editorial records (how-tos, playbooks, resources, comparisons). Composed from 07-goal (header, tags, rail with
// aside) and 10-kit (stepper with progress saved on the device). New composition, needs design review.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Crumbs, Icon, NextStepCard, Prog, Tag, Tile, type NextStep } from "./da";
import { openSuggest } from "./SuggestSheet";
import { deviceActions, useDevice, useHydrated } from "../lib/store";

export function RecordPage({
  crumbs,
  label,
  title,
  lead,
  tags,
  children,
  aside,
  sources,
  recordId,
  next,
}: {
  crumbs: { to?: string; label: string }[];
  label: string;
  title: string;
  lead?: string;
  tags?: { hue: string; icon?: string; text: string }[];
  children: ReactNode;
  aside?: ReactNode;
  sources?: { id: string; title: string; url: string; publisher?: string }[];
  recordId?: string;
  next?: NextStep;
}) {
  return (
    <section className="wrap" style={{ paddingTop: 22 }}>
      <Crumbs items={crumbs} />
      <div style={{ marginTop: 12, maxWidth: 760 }}>
        <div className="row g6 wrapf">
          <Tag hue="violet" icon="book-open">
            {label}
          </Tag>
          {tags?.map((t) => (
            <Tag key={t.text} hue={t.hue} icon={t.icon}>
              {t.text}
            </Tag>
          ))}
        </div>
        <h1 className="t-h1" style={{ marginTop: 10 }}>
          {title}
        </h1>
        {lead && (
          <p className="t-lg mu" style={{ marginTop: 6 }}>
            {lead}
          </p>
        )}
      </div>
      <div className="rail" style={{ marginTop: 22 }}>
        <div className="col g16">
          {children}
          {next && <NextStepCard next={next} />}
        </div>
        <aside className="col g16">
          {aside}
          {sources && sources.length > 0 && (
            <div className="card pad">
              <div className="t-label">Sources</div>
              <div className="list" style={{ marginTop: 4 }}>
                {sources.map((s) => (
                  <a key={s.id} className="li t-sm" href={s.url} target="_blank" rel="noopener noreferrer">
                    <Icon name="external" />
                    <span className="fl1">
                      {s.title}
                      {s.publisher && <span className="su"> · {s.publisher}</span>}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <a
            className="row g8 t-sm mu"
            href="/suggest"
            data-da="suggest-edit"
            onClick={(e) => {
              e.preventDefault();
              openSuggest({ on: title, recordId });
            }}
          >
            <Icon name="edit" /> Something wrong? <span className="pr b6">Suggest an edit</span>
          </a>
        </aside>
      </div>
    </section>
  );
}

export function Bullets({ title, items, icon = "check" }: { title: string; items?: string[]; icon?: string }) {
  if (!items?.length) return null;
  return (
    <div className="card pad">
      <div className="t-label">{title}</div>
      <div className="col g8 t-sm" style={{ marginTop: 10 }}>
        {items.map((x) => (
          <div key={x} className="row g8 as">
            <span className={icon === "flag" ? "" : "se"} style={icon === "flag" ? { color: "var(--da-color-error)" } : undefined}>
              <Icon name={icon} />
            </span>
            <span>{x}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Stepper (10-kit) with steps the reader can tick off; saved on the device. */
export function Steps({ id, steps }: { id: string; steps: { n: number; title: string; body: string; extra?: string }[] }) {
  const dev = useDevice();
  const hydrated = useHydrated();
  const done = new Set(dev?.kits[`rec:${id}`] ?? []);
  const cur = steps.findIndex((s) => !done.has(s.n));
  return (
    <div>
      <div className="row sb">
        <h2 className="t-h3">{steps.length} steps</h2>
        <span className="row g10 t-sm mu">
          <Prog value={hydrated ? done.size / steps.length : 0} style={{ width: 120 }} />
          {hydrated ? done.size : 0} of {steps.length} · saved on this device
        </span>
      </div>
      <ol style={{ listStyle: "none", padding: 0, margin: "18px 0 0" }}>
        {steps.map((s, i) => {
          const isDone = hydrated && done.has(s.n);
          const isNow = hydrated && i === cur;
          return (
            <li key={s.n} className={`step ${isDone ? "done" : isNow ? "now" : ""}`}>
              <button type="button" className="n" aria-pressed={isDone} aria-label={isDone ? `Mark step ${s.n} not done` : `Mark step ${s.n} done`} onClick={() => deviceActions.setKitStep(`rec:${id}`, s.n, !isDone)}>
                {isDone ? <Icon name="check" /> : s.n}
              </button>
              <div className="fl1">
                {isNow ? (
                  <div className="card el feat pad" style={{ padding: "16px 18px" }}>
                    <div className="b7 ttl">{s.title}</div>
                    <div className="t-sm mu" style={{ marginTop: 6 }}>
                      {s.body}
                    </div>
                    {s.extra && (
                      <div className="t-xs su" style={{ marginTop: 8 }}>
                        {s.extra}
                      </div>
                    )}
                    <button type="button" className="btn p sm" style={{ marginTop: 12 }} onClick={() => deviceActions.setKitStep(`rec:${id}`, s.n, true)}>
                      <Icon name="check" /> Done
                    </button>
                  </div>
                ) : (
                  <div style={{ paddingTop: 5 }}>
                    <div className="b6 ttl">{s.title}</div>
                    <div className="t-sm mu" style={{ marginTop: 2 }}>
                      {s.body}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function RecordList({ label, title, lead, items, base, icon, hue }: { label: string; title: string; lead: string; items: { slug: string; title: string; summary?: string }[]; base: string; icon: string; hue: string }) {
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">{label}</span>
      <h1 className="t-h1" style={{ marginTop: 6 }}>
        {title}
      </h1>
      <p className="t-lg mu" style={{ marginTop: 6 }}>
        {lead}
      </p>
      <div className="grid c3" style={{ marginTop: 18 }}>
        {items.map((t) => (
          <Link key={t.slug} className="card pad col g12" to={`${base}${t.slug}`}>
            <Tile icon={icon} hue={hue} />
            <span className="b7" style={{ lineHeight: 1.3 }}>
              {t.title}
            </span>
            {t.summary && <span className="t-sm mu">{t.summary}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
