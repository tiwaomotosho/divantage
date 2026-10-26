// S40 Helper page (reference 15-helper): photo hero, "What is a helper?" explainer (D-100), stage cards,
// NextStepCard, helper bar + first-run coach mark. Stage details and checklists open in a sheet (on-device ticks).
import { useState } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/helpers.$slug";
import { helperData } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { FlagOff, Icon, NextStepCard, Picture, Sheet, Tag, ToolLogo, toast } from "../components/da";
import { OutcomePrompt } from "../components/Outcome";
import { deviceActions, helperActions, retentionActions, storageAvailable, useDevice, useHelperState, useHydrated, useRetention } from "../lib/store";

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
  const dev = useDevice();
  const hydrated = useHydrated();
  const [open, setOpen] = useState<number | null>(null);
  const [share, setShare] = useState(false);
  const ret = useRetention();
  const [draft, setDraft] = useState("");
  const ticks = state?.progress[h.slug]?.ticks ?? {};
  const isActive = state?.active === h.slug && !state.paused;
  const stageDone = (s: (typeof h.stages)[number]) => s.done.every((_, i) => ticks[`${s.n}-${i}`]);
  const doneCount = hydrated ? h.stages.filter(stageDone).length : 0;
  const current = h.stages.find((s) => !stageDone(s)) ?? null;
  const step = current?.steps[0];
  const stage = open !== null ? h.stages.find((s) => s.n === open) : undefined;

  return (
    <>
      <section className="hero-media" style={{ minHeight: "clamp(220px,28vw,300px)" }}>
        <Picture slug={h.photo} ratio="wide" sizes="100vw" priority fill />
        <div className="scrimg" />
        <div className="wrap on-media" style={{ position: "relative", paddingTop: "clamp(80px,9vw,56px)", paddingBottom: 22 }}>
          <span className="tag glass">
            <Icon name={h.icon} /> Helper · {h.short}
          </span>
          <h1 className="t-h1" style={{ marginTop: 10, maxWidth: 640 }}>
            {h.promise}
          </h1>
          <div className="row g10 wrapf" style={{ marginTop: 14 }}>
            {!isActive ? (
              <button type="button" className="btn p" disabled={!hydrated} onClick={() => {
                helperActions.start(h.slug);
                deviceActions.hideHelper(false);
              }}>
                {state?.progress[h.slug] ? "Resume" : "Start"} the {h.short} helper <Icon name="arrow-right" />
              </button>
            ) : (
              dev?.helperHidden && (
                <button type="button" className="btn glass" onClick={() => deviceActions.hideHelper(false)}>
                  <Icon name="route" /> Show the helper bar
                </button>
              )
            )}
            <button type="button" className="btn glass" onClick={() => {
              helperActions.start(h.slug, "someone");
              deviceActions.hideHelper(false);
              setShare(true);
            }}>
              <Icon name="users" /> Start for someone else
            </button>
            <button type="button" className="btn glass" onClick={() => setShare(true)}>
              <Icon name="share" /> Share
            </button>
          </div>
        </div>
      </section>
      <section className="wrap" style={{ paddingTop: 22 }}>
        <div className="banner info" data-da="helper-explainer">
          <Icon name="route" />
          <div className="fl1 t-sm">
            <b>What is a helper?</b> A step-by-step guide for your kind of work. It stays at the bottom of the screen while you open tools, so you never lose your place.
          </div>
        </div>
        {hydrated && !storageAvailable() && (
          <div className="banner err" style={{ marginTop: 12 }}>
            <Icon name="alert" />
            <span className="t-sm">Your browser is blocking storage, so your ticks work for now but won't be remembered.</span>
          </div>
        )}
        <div className="row sb" style={{ marginTop: 18 }}>
          <h2 className="t-h3">
            {h.stage_count} stages · {h.tool_count} tools
          </h2>
          <span className="t-sm mu">
            {doneCount} of {h.stages.length} done
          </span>
        </div>
        <div className="grid c3" style={{ marginTop: 12 }}>
          {h.stages.map((s) => {
            const isDone = hydrated && stageDone(s);
            const isNow = hydrated && current?.n === s.n;
            return (
              <button key={s.n} type="button" className={`card pad ${isNow ? "el feat" : ""}`} data-da="stage-card" style={{ textAlign: "left" }} onClick={() => setOpen(s.n)} aria-label={`Stage ${s.n}: ${s.title}. Open steps and checklist`}>
                <div className="row sb">
                  <span className="t-mono t-xs su">STAGE {s.n}</span>
                  {isDone ? (
                    <span className="chk" aria-checked="true">
                      <Icon name="check" />
                    </span>
                  ) : isNow ? (
                    <Tag hue="violet">Now</Tag>
                  ) : null}
                </div>
                <div className="b7" style={{ marginTop: 8 }}>
                  {s.title}
                </div>
                <div className="row g6" style={{ marginTop: 12 }}>
                  {s.steps.slice(0, 4).map((st) =>
                    st.exists ? <ToolLogo key={st.tool} slug={st.tool} size="sm" /> : null,
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 22 }}>
          {current && step ? (
            <NextStepCard
              next={{ kicker: `Your next step · Stage ${current.n}`, title: step.what, sub: `First win: ${step.first_win}`, url: `/tools/${step.tool}`, cta: "Continue" }}
              onClick={() => {
                if (!isActive) helperActions.start(h.slug);
                helperActions.opened(h.slug, step.tool);
              }}
            />
          ) : (
            <NextStepCard next={{ kicker: "Helper complete", title: `You've finished the ${h.short} helper`, sub: "Share it with someone who's starting out, or pick another helper.", url: "/helpers", cta: "See helpers" }} />
          )}
        </div>
      </section>
      <Sheet open={Boolean(stage)} onClose={() => setOpen(null)} labelledBy="stage-title" da="stage-sheet">
        {stage && (
          <>
            <div className="row sb" style={{ marginTop: 12 }}>
              <h2 id="stage-title" className="t-h3">
                Stage {stage.n}: {stage.title}
              </h2>
              <button type="button" className="ib" aria-label="Close" onClick={() => setOpen(null)}>
                <Icon name="x" />
              </button>
            </div>
            <p className="t-sm mu" style={{ marginTop: 6 }}>
              {stage.goal} · About {stage.time}
            </p>
            <div className="list" style={{ marginTop: 10 }}>
              {stage.steps.map((st) => (
                <div key={st.tool} className="li as">
                  {st.exists && <ToolLogo slug={st.tool} size="sm" />}
                  <div className="fl1">
                    <Link className="b7 t-sm" to={`/tools/${st.tool}`} onClick={() => helperActions.opened(h.slug, st.tool)}>
                      {st.name}
                    </Link>
                    <div className="t-sm mu">{st.what}</div>
                    <div className="t-xs su">First win: {st.first_win}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="t-label" style={{ marginTop: 14 }}>
              You're done when
            </div>
            <div className="col g8" style={{ marginTop: 8 }}>
              {stage.done.map((line, i) => {
                const k = `${stage.n}-${i}`;
                const on = Boolean(ticks[k]);
                return (
                  <div key={k} className="row g10 t-sm">
                    <button
                      type="button"
                      className="chk"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={line}
                      disabled={!hydrated}
                      onClick={() => {
                        if (!state?.active) helperActions.start(h.slug);
                        helperActions.tick(h.slug, k, !on);
                      }}
                    >
                      {on && <Icon name="check" />}
                    </button>
                    <span className={on ? "mu" : ""}>{line}</span>
                  </div>
                );
              })}
            </div>
            <div className="t-label" style={{ marginTop: 16 }}>
              Save what you made (optional)
            </div>
            {ret?.outputs[`${h.slug}:${stage.n}`] && (
              <div className="t-sm mu" style={{ marginTop: 6 }}>
                Saved: {ret.outputs[`${h.slug}:${stage.n}`].text}
              </div>
            )}
            <form
              className="row g8"
              style={{ marginTop: 8 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                retentionActions.saveOutput(`${h.slug}:${stage.n}`, draft.trim());
                setDraft("");
                toast("Saved on this device.");
              }}
            >
              <label className="input fl1">
                <Icon name="edit" />
                <input value={draft} maxLength={280} onChange={(e) => setDraft(e.target.value)} placeholder="A link, or a line about what you made" aria-label="What you made" />
              </label>
              <button type="submit" className="btn s">
                Save
              </button>
            </form>
            {stageDone(stage) && <OutcomePrompt id={`helper:${h.slug}:${stage.n}`} label={`${h.short} · ${stage.title}`} />}
            <button type="button" className="btn p blk" style={{ marginTop: 18 }} onClick={() => setOpen(null)}>
              Done
            </button>
          </>
        )}
      </Sheet>
      <Sheet open={share} onClose={() => setShare(false)} labelledBy="share-title" da="share-sheet">
        <div className="row sb" style={{ marginTop: 12 }}>
          <h2 id="share-title" className="t-h3">
            Help someone with the {h.short} helper
          </h2>
          <button type="button" className="ib" aria-label="Close" onClick={() => setShare(false)}>
            <Icon name="x" />
          </button>
        </div>
        <div className="card pad" style={{ marginTop: 12 }} data-da="toolkit-card">
          <div className="b7">{h.promise}</div>
          <ol className="t-sm" style={{ margin: "10px 0 0", paddingLeft: 18 }}>
            {h.stages.map((st) => (
              <li key={st.n}>
                {st.title} · {st.steps[0]?.name}
              </li>
            ))}
          </ol>
          <div className="t-xs su" style={{ marginTop: 10 }}>
            Free at {typeof location !== "undefined" ? location.host : "this site"}/helpers/{h.slug}
          </div>
        </div>
        <div className="col g10" style={{ marginTop: 14 }}>
          <a className="btn p blk" href={`https://wa.me/?text=${encodeURIComponent(`${h.title}: ${h.promise}
${typeof location !== "undefined" ? location.origin : ""}/helpers/${h.slug}`)}`} target="_blank" rel="noopener noreferrer">
            <Icon name="message" /> Send on WhatsApp
          </a>
          <button type="button" className="btn s blk" onClick={async () => {
            try {
              await navigator.clipboard.writeText(`${location.origin}/helpers/${h.slug}`);
              toast("Link copied.");
            } catch {
              toast("Couldn't copy the link.");
            }
          }}>
            <Icon name="share" /> Copy link
          </button>
          <button type="button" className="btn g blk" onClick={() => window.print()}>
            Print this card
          </button>
        </div>
      </Sheet>
    </>
  );
}
