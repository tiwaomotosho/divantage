// S42 Goals (reference 06-goals): goal search, Compete/Grow/Scale cards (intent chips filter, never hide), grouped goals.
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/goals";
import { goalsIndexData } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { loadGoalSearch, useLazy } from "../lib/indexes";
import { FlagOff, Icon, Tile } from "../components/da";
import { useDevice } from "../lib/store";

export const loader = () => goalsIndexData();
export const meta: Route.MetaFunction = ({ data: d }) => pageMeta("Goals", `${d?.total ?? ""} things you can get done with the right tools.`);

export default function Goals({ loaderData: d }: Route.ComponentProps) {
  if (!flag("goals")) return <FlagOff />;
  const [params, setParams] = useSearchParams();
  const intent = params.get("intent");
  const family = params.get("family");
  const [q, setQ] = useState("");
  const [touched, setTouched] = useState(false);
  const dev = useDevice();
  const search = useLazy(loadGoalSearch, touched);
  const results = useMemo(() => (search.status === "ready" && q.trim().length >= 2 ? search.value!.search(q, dev?.market === "other" ? undefined : dev?.market).filter((r) => !r.doc.id.startsWith("kit:")).slice(0, 8) : []), [search, q, dev?.market]);
  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true, preventScrollReset: true });
  };
  const families = d.families
    .map((f) => ({ ...f, goals: intent ? f.goals.filter((g) => g.intents.includes(intent)) : f.goals }))
    .filter((f) => f.goals.length && (!family || f.slug === family));

  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">Goals</span>
      <h1 className="t-h1" style={{ marginTop: 6 }}>
        {d.total.toLocaleString("en-GB")} things you can get done
      </h1>
      <div style={{ position: "relative" }}>
        <label className="input" style={{ marginTop: 18 }}>
          <Icon name="search" />
          <input placeholder="I want to… e.g. send an invoice" aria-label="Search goals" value={q} onFocus={() => setTouched(true)} onChange={(e) => setQ(e.target.value)} />
          <span className="kbd desk">⌘K</span>
        </label>
        {results.length > 0 && (
          <div className="card el" style={{ marginTop: 8, padding: "4px 16px" }}>
            <div className="list">
              {results.map((r) => (
                <Link key={r.doc.id} className="li t-sm" to={`/goals/${r.doc.id}`}>
                  <Icon name="target" />
                  <span className="fl1 b6">{r.doc.label}</span>
                  <Icon name="chevron-right" className="cr" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      {flag("intent_chips") && (
        <div className="grid c3" style={{ marginTop: 18 }}>
          {d.intents.map((it) => {
            const on = intent === it.slug;
            return (
              <button key={it.slug} type="button" className="card pad col g10" style={{ textAlign: "left", border: on ? "2px solid var(--da-color-ink)" : undefined }} aria-pressed={on} onClick={() => setParam("intent", on ? null : it.slug)}>
                <Tile icon={it.icon} hue={it.hue} />
                <div className="row sb ae">
                  <span className="t-h3">{it.label}</span>
                  <span className="t-mono t-xs su">{it.count} goals</span>
                </div>
                <span className="t-sm mu">{it.promise}</span>
              </button>
            );
          })}
        </div>
      )}
      {family && (
        <div className="row g8" style={{ marginTop: 16 }}>
          <button type="button" className="chip sm" onClick={() => setParam("family", null)}>
            <Icon name="arrow-left" /> All groups
          </button>
        </div>
      )}
      <div className="grid c3" style={{ marginTop: 16 }}>
        {families.map((f) => (
          <div key={f.slug} className="card pad">
            <div className="row sb">
              <div className="b7">{f.label}</div>
              <span className="t-mono t-xs su">{f.goals.length}</span>
            </div>
            <div className="list" style={{ marginTop: 6 }}>
              {(family ? f.goals : f.goals.slice(0, 3)).map((g) => (
                <Link key={g.slug} className="li t-sm" to={`/goals/${g.slug}`}>
                  <Icon name="target" />
                  <span className="fl1">{g.label}</span>
                  <Icon name="chevron-right" className="cr" />
                </Link>
              ))}
            </div>
            {!family && f.goals.length > 3 && (
              <button type="button" className="t-sm pr b6" style={{ minHeight: 44 }} onClick={() => setParam("family", f.slug)}>
                See all {f.goals.length} →
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
