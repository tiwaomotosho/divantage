// S40 Helper page: route rail, steps, "You're done when" checklists (on-device only, da.helper.v1).
import { useEffect, useState } from "react";
import { Link, data } from "react-router";
import { Share2 } from "lucide-react";
import { FlagOff } from "../components/ui";
import type { Route } from "./+types/helpers.$slug";
import { helperData } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { Breadcrumb, Callout, ChipList, TrustFooter } from "../components/ui";
import { HelperCard, ProgressBar, RailNode } from "../components/HelperBits";
import { helperActions, storageAvailable, useHelperState, useHydrated } from "../lib/store";

export function loader({ params }: Route.LoaderArgs) {
  const d = helperData(params.slug);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.helper.title, d.helper.promise) : pageMeta("Not found"));

export default function HelperPage({ loaderData: d }: Route.ComponentProps) {
  if (!flag("helpers")) return <FlagOff />;
  const h = d.helper;
  const state = useHelperState();
  const hydrated = useHydrated();
  const [noStore, setNoStore] = useState(false);
  useEffect(() => setNoStore(!storageAvailable()), []);
  const p = state?.progress[h.slug];
  const ticks = p?.ticks ?? {};
  const isActive = state?.active === h.slug;
  const total = h.stages.reduce((a, s) => a + s.done.length, 0);
  const done = h.stages.reduce((a, s) => a + s.done.filter((_, i) => ticks[`${s.n}-${i}`]).length, 0);
  const finished = hydrated && done === total && total > 0;
  const [shared, setShared] = useState("");

  async function share() {
    const url = location.origin + `/helpers/${h.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: h.title, text: h.promise, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared("Link copied");
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="helper-page">
      <section className="helper-band" data-tint={h.tint}>
        <div className="container">
          <Breadcrumb items={[{ to: "/helpers", label: "Helpers" }, { label: h.title }]} />
          <h1 className="display-sm">{h.short}</h1>
          <p className="helper-promise">{h.promise}</p>
          <p className="reading">{h.intro}</p>
          <ul className="chip-list chip-list-plain">
            <li className="chip chip-static">{h.stage_count} stages</li>
            <li className="chip chip-static">{h.tool_count} tools</li>
          </ul>
          <ChipList items={h.identities.map((i) => ({ to: `/for/${i.slug}`, label: i.label }))} />
          <div className="form-actions">
            {!isActive || state?.paused ? (
              <button type="button" className="btn btn-ink" onClick={() => helperActions.start(h.slug)} disabled={!hydrated}>
                {p ? "Resume" : "Start"}
              </button>
            ) : (
              <span className="badge badge-starts">You're following this helper</span>
            )}
            <button type="button" className="btn btn-secondary" onClick={share}>
              <Share2 size={18} aria-hidden="true" /> Share
            </button>
            {flag("helper_for_someone") && (
              <button type="button" className="btn btn-tertiary" onClick={() => helperActions.start(h.slug, "someone")}>
                Start for someone else
              </button>
            )}
            {shared && <span role="status">{shared}</span>}
          </div>
        </div>
      </section>

      <div className="progress-sticky">
        <div className="container">
          <ProgressBar done={hydrated ? done : 0} total={total} label={`${h.short} helper progress`} />
        </div>
      </div>

      <div className="container helper-layout">
        <div>
          {!hydrated && <noscript><p className="meta">Turn on JavaScript to save your progress on this device.</p></noscript>}
          {noStore && <Callout tone="warning">Your browser is blocking storage, so your ticks will work for now but won't be remembered.</Callout>}
          {finished && (
            <Callout tone="success" title={`You've finished the ${h.short} helper`}>
              <p>Well done. Share it with someone who's starting out, or try another helper below.</p>
            </Callout>
          )}
          <ol className="rail">
            {h.stages.map((s) => {
              const stageDone = s.done.every((_, i) => ticks[`${s.n}-${i}`]);
              return (
                <li key={s.n} className="rail-stage" id={`stage-${s.n}`}>
                  <RailNode n={s.n} done={hydrated && stageDone} />
                  <div className="rail-body">
                    <h2>{s.title}</h2>
                    <p>{s.goal}</p>
                    <p className="meta">About {s.time}</p>
                    <ul className="steps">
                      {s.steps.map((st) => {
                        const tool = d.tools[st.tool];
                        return (
                          <li key={st.tool} className="step-row">
                            <div className="step-head">
                              {tool.exists ? (
                                <Link to={`/tools/${st.tool}`} onClick={() => helperActions.opened(h.slug, st.tool)} className="step-tool">
                                  {tool.name}
                                </Link>
                              ) : (
                                <span className="step-tool">{tool.name}</span>
                              )}
                              <span className={`badge ${tool.guide ? "badge-starts" : "badge-ghost"}`}>{tool.guide ? "Full guide" : "Guide in progress"}</span>
                            </div>
                            <p>{st.what}</p>
                            <p className="meta">First win: {st.first_win}</p>
                          </li>
                        );
                      })}
                    </ul>
                    <fieldset className="done-list">
                      <legend>You're done when</legend>
                      {s.done.map((line, i) => {
                        const k = `${s.n}-${i}`;
                        return (
                          <label key={k} className={`check${ticks[k] ? " is-ticked" : ""}`}>
                            <input type="checkbox" checked={Boolean(ticks[k])} disabled={!hydrated} onChange={(e) => {
                              if (!state?.active) helperActions.start(h.slug);
                              helperActions.tick(h.slug, k, e.target.checked);
                            }} />
                            <span>{line}</span>
                          </label>
                        );
                      })}
                    </fieldset>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <aside className="on-this-path" aria-label="On this path">
          <p className="label">On this path</p>
          <ol>
            {h.stages.map((s) => (
              <li key={s.n}>
                <a href={`#stage-${s.n}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <div className="container">
        <section className="section closing-band">
          <h2>Know someone on this path?</h2>
          <button type="button" className="btn btn-secondary" onClick={share}>
            <Share2 size={18} aria-hidden="true" /> Share this helper
          </button>
        </section>
        {d.others.length > 0 && (
          <section className="section">
            <h2>Other helpers</h2>
            <ul className="helper-cards">
              {d.others.map((o) => (
                <li key={o.slug}>
                  <HelperCard h={o} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <TrustFooter kind="helper" note="This path is AI-drafted and waiting for a practitioner's review (D-045). Tools marked 'Guide in progress' show only their official link and course outline." />
      </div>
    </div>
  );
}
