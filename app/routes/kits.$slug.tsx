// S50 Kit page (reference 10-kit): photo hero, "Continue at step N", stepper with the current step expanded,
// safety note, "Good for", NextStepCard. Progress is saved on the device.
import { useEffect } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/kits.$slug";
import { kitData } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { Crumbs, FlagOff, Icon, NextStepCard, Picture, Prog, SafetyNote, StarButton, Tag, ToolLogo } from "../components/da";
import { deviceActions, useDevice, useHydrated } from "../lib/store";
import { OutcomePrompt } from "../components/Outcome";

export function loader({ params }: Route.LoaderArgs) {
  const d = kitData(params.slug);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.kit.title, d.kit.promise) : pageMeta("Not found"));

export default function KitPage({ loaderData: d }: Route.ComponentProps) {
  if (!flag("kits")) return <FlagOff />;
  const dev = useDevice();
  const hydrated = useHydrated();
  const done = new Set(dev?.kits[d.kit.slug] ?? []);
  const current = d.steps.findIndex((_, i) => !done.has(i + 1));
  const cur = current === -1 ? d.steps.length - 1 : current;
  const finished = current === -1;
  const step = d.steps[cur];
  useEffect(() => {
    if (hydrated && done.size) deviceActions.visit({ url: `/kits/${d.kit.slug}`, title: d.kit.title, kicker: `Kit · step ${cur + 1} of ${d.steps.length}`, at: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, d.kit.slug]);
  const toggle = (i: number) => deviceActions.setKitStep(d.kit.slug, i + 1, !done.has(i + 1));

  return (
    <>
      <section className="hero-media" style={{ minHeight: "clamp(240px,32vw,320px)" }} data-da="kit-hero">
        <Picture slug={d.kit.photo} ratio="wide" sizes="100vw" priority fill />
        <div className="scrimg" />
        <div className="wrap on-media" style={{ position: "relative", paddingTop: "clamp(90px,10vw,48px)", paddingBottom: 24 }}>
          <Crumbs items={[{ to: "/kits", label: "Kits" }, { label: "Common situation" }]} />
          <h1 className="t-display" style={{ marginTop: 10, maxWidth: 640 }}>
            {d.kit.title}
          </h1>
          <p className="t-lg desk" style={{ opacity: 0.85, maxWidth: 540, marginTop: 8 }}>
            {d.kit.promise}
          </p>
          <div className="row g10" style={{ marginTop: 16 }}>
            <Link className="btn p" to={`/goals/${step.slug}`}>
              {finished ? "Review the last step" : done.size ? `Continue at step ${cur + 1}` : "Start step 1"} <Icon name="arrow-right" />
            </Link>
            {flag("stars") && (
              <span className="glass" style={{ borderRadius: 999 }}>
                <StarButton item={{ type: "kit", slug: d.kit.slug, label: d.kit.title }} />
              </span>
            )}
          </div>
        </div>
      </section>
      <section className="wrap rail" style={{ paddingTop: 24 }}>
        <div>
          <div className="row sb">
            <h2 className="t-h3">{d.steps.length} steps</h2>
            <span className="row g10 t-sm mu">
              <Prog value={done.size / d.steps.length} style={{ width: 120 }} />
              {done.size} of {d.steps.length} · saved on this device
            </span>
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: "18px 0 0" }}>
            {d.steps.map((s, i) => {
              const isDone = done.has(i + 1);
              const isNow = i === cur && !finished;
              return (
                <li key={s.slug} className={`step ${isDone ? "done" : isNow ? "now" : ""}`} data-da="kit-step">
                  <button type="button" className="n" aria-label={isDone ? `Mark step ${i + 1} not done` : `Mark step ${i + 1} done`} aria-pressed={isDone} onClick={() => toggle(i)}>
                    {isDone ? <Icon name="check" /> : i + 1}
                  </button>
                  <div className="fl1">
                    {isNow ? (
                      <div className="card el feat pad" style={{ padding: "16px 18px" }}>
                        <Link className="b7 ttl" to={`/goals/${s.slug}`}>
                          {s.label}
                        </Link>
                        <div className="row g8 wrapf" style={{ marginTop: 10 }}>
                          {s.tools.map((t) => (
                            <ToolLogo key={t.slug} slug={t.slug} size="sm" />
                          ))}
                          {s.safety && (
                            <Tag hue="coral" icon="shield">
                              {s.safety[0].toUpperCase() + s.safety.slice(1)}
                            </Tag>
                          )}
                          <span className="fl1" />
                          <Link className="btn p sm" to={`/goals/${s.slug}`} data-da="learn-tool">
                            Continue <Icon name="arrow-right" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div style={{ paddingTop: 5 }}>
                        <Link className="b6 ttl" to={`/goals/${s.slug}`}>
                          {s.label}
                        </Link>
                        <div className="t-xs su">{s.tools.map((t) => t.name).join(" · ")}</div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {finished && hydrated && <OutcomePrompt id={`kit:${d.kit.slug}`} label={d.kit.title} />}
          <div style={{ height: 16 }} />
          <NextStepCard
            next={
              finished
                ? { kicker: "Kit complete", title: "You've done every step", sub: "Pick another kit for your next goal.", url: "/kits", cta: "See kits" }
                : { kicker: `Your next step · Kit step ${cur + 1} of ${d.steps.length}`, title: step.label, sub: step.tools.length ? `Uses ${step.tools.slice(0, 2).map((t) => t.name).join(" and ")}` : "Open the goal", url: `/goals/${step.slug}`, cta: "Continue" }
            }
          />
        </div>
        <aside className="col g16">
          {flag("goal_safety") && d.safety && <SafetyNote s={d.safety} />}
          {d.goodFor.length > 0 && (
            <div className="card pad">
              <div className="t-label">Good for</div>
              <div className="row g6 wrapf" style={{ marginTop: 10 }}>
                {d.goodFor.map((g) => (
                  <Link key={g.slug} className="chip sm" to={`/for/${g.slug}`}>
                    {g.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
