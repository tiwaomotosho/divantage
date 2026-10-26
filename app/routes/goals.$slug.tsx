// S43 Goal page (reference 07-goal, 08-goal-safety-sheet): intent + market tags, kit ribbon, tool rows with
// TrustLine + Learn button + DepthLabel, alternatives, safety note (sheet on ?sheet=safety), related goals, NextStepCard.
import { useEffect, useState } from "react";
import { Link, data, useSearchParams } from "react-router";
import type { Route } from "./+types/goals.$slug";
import { goalData } from "~/lib/content.server";
import { MARKET_LABEL } from "~/lib/view";
import { flag, meta as pageMeta } from "../lib/build";
import { Crumbs, Icon, NextStepCard, Prog, SafetyNote, Sheet, ShareButton, StarButton, Tag, ToolLogo, ToolRowCard } from "../components/da";
import { deviceActions, useDevice, useHydrated } from "../lib/store";

export function loader({ params }: Route.LoaderArgs) {
  const d = goalData(params.slug);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.goal.label, d.need?.description) : pageMeta("Not found"));

export default function GoalPage({ loaderData: d }: Route.ComponentProps) {
  const [params, setParams] = useSearchParams();
  const hydrated = useHydrated();
  const dev = useDevice();
  const market = dev?.market ?? "ng";
  const [freeOnly, setFreeOnly] = useState(false);
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    if (hydrated && params.get("sheet") === "safety" && d.safety) setSheet(true);
  }, [hydrated, params, d.safety]);
  useEffect(() => {
    deviceActions.visit({ url: `/goals/${d.goal.slug}`, title: d.goal.label, kicker: d.kit ? `${d.kit.title} · step ${d.kit.step} of ${d.kit.total}` : "Goal", at: new Date().toISOString() });
  }, [d.goal.slug, d.goal.label, d.kit]);
  const closeSheet = () => {
    setSheet(false);
    if (params.get("sheet")) {
      const p = new URLSearchParams(params);
      p.delete("sheet");
      setParams(p, { replace: true, preventScrollReset: true });
    }
  };
  const tools = freeOnly ? d.tools.filter((t) => t.trust.price === "Free" || t.trust.price === "Open source" || t.trust.price.startsWith("Free plan")) : d.tools;
  const markets = d.goal.markets.includes("all") ? "Everywhere" : d.goal.markets.map((m) => MARKET_LABEL[m] ?? m).join(" · ");
  const kitDone = d.kit ? (dev?.kits[d.kit.slug] ?? []) : [];

  return (
    <>
      <section className="wrap" style={{ paddingTop: 22 }}>
        <Crumbs items={[{ to: "/goals", label: "Goals" }, { to: d.need ? `/needs/${d.need.slug}` : undefined, label: d.need?.label ?? "Goal" }]} />
        <div className="row sb ae wrapf g16" style={{ marginTop: 12 }}>
          <div style={{ maxWidth: 760 }}>
            <div className="row g6 wrapf">
              {d.goal.intents.slice(0, 1).map((it) => (
                <Tag key={it.slug} hue={it.hue} icon={it.icon}>
                  {it.label}
                </Tag>
              ))}
              <Tag hue="slate" icon="globe">
                {markets}
              </Tag>
              {d.safety && (
                <button type="button" className="tag h-amber" onClick={() => setSheet(true)}>
                  <Icon name="shield" /> Safety tips
                </button>
              )}
            </div>
            <h1 className="t-h1" style={{ marginTop: 10 }}>
              {d.goal.label}
            </h1>
            {d.need && (
              <p className="t-lg mu" style={{ marginTop: 6 }}>
                {d.need.description}
              </p>
            )}
          </div>
          <div className="row g10">
            {flag("stars") && <StarButton item={{ type: "goal", slug: d.goal.slug, label: d.goal.label }} />}
            <ShareButton title={d.goal.label} />
          </div>
        </div>
        {d.kit && (
          <div className="card soft row g12 wrapf" style={{ marginTop: 18, padding: "12px 16px" }} data-da="kit-ribbon">
            <Tag hue="violet" icon="layers">
              Kit
            </Tag>
            <Link className="b7" to={`/kits/${d.kit.slug}`}>
              {d.kit.title}
            </Link>
            <span className="t-sm mu">
              Step {d.kit.step} of {d.kit.total}
            </span>
            <Prog className="pr fl1" value={d.kit.step / d.kit.total} style={{ minWidth: 120, maxWidth: 300 }} />
            <span className="fl1 desk" />
            {d.kit.prev && (
              <Link className="btn g sm desk" to={`/goals/${d.kit.prev}`}>
                <Icon name="arrow-left" /> Back
              </Link>
            )}
            {d.kit.next ? (
              <Link className="btn p sm" to={`/goals/${d.kit.next}`} onClick={() => deviceActions.setKitStep(d.kit!.slug, d.kit!.step, true)}>
                Next step <Icon name="arrow-right" />
              </Link>
            ) : (
              <Link className="btn p sm" to={`/kits/${d.kit.slug}`} onClick={() => deviceActions.setKitStep(d.kit!.slug, d.kit!.step, true)}>
                {kitDone.length + 1 >= d.kit.total ? "Finish kit" : "Back to kit"} <Icon name="arrow-right" />
              </Link>
            )}
          </div>
        )}
        <div className="rail" style={{ marginTop: 22 }}>
          <div className="col g12">
            <div className="row sb">
              <h2 className="t-h3">Tools for this goal</h2>
              <span className="row g8">
                <button type="button" className="chip sm" aria-pressed={freeOnly} onClick={() => setFreeOnly(!freeOnly)}>
                  <Icon name="filter" /> Free only
                </button>
              </span>
            </div>
            {tools.length === 0 && <p className="t-sm mu">No free options in the top picks. Turn off "Free only" to see all.</p>}
            {tools.map((t, i) => (
              <ToolRowCard key={t.slug} t={t} rank={i + 1} top={i === 0 && !freeOnly} market={market} />
            ))}
            {flag("alternatives") && d.alternatives.length > 0 && (
              <>
                <div className="row sb" style={{ marginTop: 10 }}>
                  <h2 className="t-h3">{d.alternatives.length} alternatives</h2>
                  <span className="t-xs su">Also used for this job</span>
                </div>
                <div className="hscroll">
                  {d.alternatives.map((a) => (
                    <Link key={a.slug} className="card row g10" to={`/tools/${a.slug}`} style={{ padding: "12px 14px", width: 200 }}>
                      <ToolLogo slug={a.slug} size="sm" />
                      <div>
                        <div className="b6 t-sm">{a.name}</div>
                        <div className="t-xs su">{a.price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
            <div style={{ marginTop: 12 }}>
              <NextStepCard next={d.next} />
            </div>
          </div>
          <aside className="col g16">
            {flag("goal_safety") && d.safety && <SafetyNote s={d.safety} />}
            {d.related.length > 0 && (
              <div className="card pad">
                <div className="t-label">Related goals</div>
                <div className="list" style={{ marginTop: 4 }}>
                  {d.related.map((r) => (
                    <Link key={r.slug} className="li t-sm" to={`/goals/${r.slug}`}>
                      <Icon name="target" />
                      <span className="fl1 b6">{r.label}</span>
                      <Icon name="chevron-right" className="cr" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
      {d.safety && (
        <Sheet open={sheet} onClose={closeSheet} labelledBy="sh1" da="safety-sheet">
          <div className="row sb" style={{ marginTop: 14 }}>
            <h2 id="sh1" className="t-h3 row g8">
              <span style={{ color: "var(--da-color-info)" }}>
                <Icon name={d.safety.icon} />
              </span>{" "}
              {d.safety.label}
            </h2>
            <button type="button" className="ib" aria-label="Close" onClick={closeSheet}>
              <Icon name="x" />
            </button>
          </div>
          <p className="t-sm" style={{ marginTop: 12 }}>
            {d.safety.what}
          </p>
          <div className="t-label" style={{ marginTop: 16 }}>
            Red flags
          </div>
          {d.safety.flags.map((f) => (
            <div key={f} className="banner err" style={{ marginTop: 8, border: 0, padding: 12 }}>
              <Icon name="flag" />
              <span>{f}</span>
            </div>
          ))}
          <p className="t-xs su" style={{ marginTop: 12 }}>
            Where to get help: {d.safety.help}.
          </p>
          <button type="button" className="btn p blk" style={{ marginTop: 18 }} onClick={closeSheet}>
            Got it
          </button>
        </Sheet>
      )}
    </>
  );
}
