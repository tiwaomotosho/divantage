// S30 Learning path (reference 13-roadmap, 14-roadmap-general). Serves /tools/{tool}/roadmap and
// /tools/{tool}/for/{identity|need}. DepthLabel on every path (D-094); general guides show the depth explainer
// with job chips and "Ask for my job" (FR-113). Ticks are saved on the device (da.ticks.v1).
import { useEffect, useMemo } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/path";
import { lensKey } from "~/lib/identity";
import { lensLevels, roadmapLevels, type ModuleView } from "~/lib/lensview";
import type { Lens, Level, Roadmap } from "~/lib/types";
import { depthLabel, type Depth, type Trust } from "~/lib/view";
import { meta as pageMeta } from "../lib/build";
import { fetchJson } from "../lib/indexes";
import { Crumbs, DepthLabel, Icon, NextStepCard, Prog, Tag, ToolLogo, TrustLine } from "../components/da";
import { openSuggest } from "../components/SuggestSheet";
import { deviceActions, tickActions, useHydrated, useTicks } from "../lib/store";

interface ToolFile {
  tool: { slug: string; name: string };
  trust: Trust;
  roadmap: Roadmap | null;
  depth: Depth | null;
  lenses: Lens[];
  lensIds: Record<string, { slug: string; label: string; plural: string }>;
  lensNeeds: string[];
  needs: { slug: string; label: string; description: string }[];
}
interface IdFile {
  identity: { slug: string; label: string; plural: string };
  resolved: { core: string[]; sector: string[]; universal: string[] };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  let t: ToolFile;
  try {
    t = await fetchJson<ToolFile>(`/data/tool/${params.tool}.json`);
  } catch {
    throw data("Not found", { status: 404 });
  }
  const rm = t.roadmap;
  if (!rm) throw data("Not found", { status: 404 });
  const x = (params as { x?: string }).x;
  const lenses = new Map(t.lenses.map((l) => [lensKey(l.roadmap, l.need), l]));
  const toolNeed = new Map(t.needs.map((n) => [n.slug, n]));
  let mode: "general" | "need" | "role" = "general";
  let need: string | null = null;
  let who: IdFile["identity"] | null = null;
  let notFit = false;
  if (x && (toolNeed.has(x) || t.lensNeeds.includes(x))) {
    mode = "need";
    need = x;
  } else if (x) {
    try {
      const id = await fetchJson<IdFile>(`/data/id/${x}.json`);
      who = id.identity;
      mode = "role";
      const order = [...id.resolved.core, ...id.resolved.sector, ...id.resolved.universal];
      const cands = order.filter((n) => toolNeed.has(n));
      need = cands.find((n) => lenses.has(lensKey(rm.slug, n))) ?? cands[0] ?? null;
      // A flagship lens written for this identity wins (doc 31 §4).
      const own = t.lenses.find((l) => l.for_identities.includes(id.identity.slug));
      if (own) need = own.need;
      notFit = !need;
    } catch {
      throw data("Not found", { status: 404 });
    }
  }
  const fl = need ? lenses.get(lensKey(rm.slug, need)) : undefined;
  const needLabel = need ? (toolNeed.get(need)?.label ?? need) : "";
  const levels: Record<Level, ModuleView[]> = need && !notFit ? lensLevels(rm, fl, need, needLabel).levels : roadmapLevels(rm);
  const flagship = Boolean(fl);
  let depth: Depth = t.depth ?? depthLabel("general");
  let title = depth.kind === "deep" ? `${t.tool.name}: learning path` : `${t.tool.name}: general guide`;
  if (mode === "role" && who) {
    title = `${t.tool.name} for ${who.plural}`;
    if (flagship) depth = { kind: "role", label: `Written for ${who.plural}` };
  } else if (mode === "need" && fl) {
    title = fl.title;
    const first = fl.for_identities[0] ? t.lensIds[fl.for_identities[0]] : undefined;
    depth = { kind: "role", label: first ? `Written for ${first.plural}` : "For your job" };
  } else if (mode === "need") {
    title = `Using ${t.tool.name} to ${needLabel[0].toLowerCase()}${needLabel.slice(1)}`;
  }
  // Job chips for the depth explainer: identities that have a path written for this tool.
  const jobChips = Object.values(t.lensIds).slice(0, 3);
  return { t, rm, title, depth, levels, who, need, notFit, fl: fl ?? null, jobChips, mode };
}

export function HydrateFallback() {
  return (
    <section className="wrap" style={{ paddingTop: 22 }} aria-busy="true" aria-label="Loading learning path">
      <div className="sk" style={{ height: 72, width: 72, borderRadius: 20 }} />
      <div className="sk" style={{ height: 36, width: "50%", marginTop: 16 }} />
      <div className="sk" style={{ height: 240, marginTop: 24 }} />
    </section>
  );
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.title, undefined, { noindex: d.mode !== "general" }) : pageMeta("Learning path"));

const LEVEL_TAG: Record<Level, { label: string; hue: string }> = {
  beginner: { label: "Beginner", hue: "green" },
  intermediate: { label: "Intermediate", hue: "blue" },
  expert: { label: "Expert", hue: "violet" },
};

export default function PathPage({ loaderData: d }: Route.ComponentProps) {
  const ticks = useTicks();
  const hydrated = useHydrated();
  const mine = ticks?.ticks[d.rm.slug] ?? {};
  const levels = (["beginner", "intermediate", "expert"] as Level[]).filter((l) => d.levels[l].length);
  const core = useMemo(() => levels.flatMap((l) => d.levels[l].filter((m) => m.relevance !== "also_useful")), [d.levels, levels]);
  const done = core.filter((m) => mine[m.slug]).length;
  const nextMod = core.find((m) => !mine[m.slug]);
  const hours = core.reduce((a, m) => a + (m.hours ?? 0), 0);
  useEffect(() => {
    deviceActions.visit({ url: location.pathname, title: d.title, kicker: `Learning path · ${done} of ${core.length} done`, tool: d.t.tool.slug, at: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.title, done]);
  const general = d.depth.kind === "general";
  const startModule = () => {
    const el = nextMod && document.getElementById(`mod-${nextMod.slug}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector<HTMLElement>(".chk")?.focus();
  };

  return (
    <section className="wrap" style={{ paddingTop: 22 }}>
      <Crumbs items={[{ to: `/tools/${d.t.tool.slug}`, label: d.t.tool.name }, { label: "Learning path" }]} />
      <div className="row sb ae wrapf g16" style={{ marginTop: 12 }}>
        <div className="row g16">
          <ToolLogo slug={d.t.tool.slug} size="lg" />
          <div>
            <h1 className="t-h1">{d.title}</h1>
            <div className="row g8 wrapf" style={{ marginTop: 6 }}>
              <DepthLabel depth={d.depth} icon />
              <Tag hue="amber" icon="clock">
                Expert review {d.rm.expert_validation?.status === "validated" ? "done" : "pending"}
              </Tag>
              <span className="t-sm mu">
                {core.length} modules{hours ? ` · ≈ ${Math.round(hours * 2) / 2} h` : ""}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <TrustLine trust={d.t.trust} />
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: "14px 18px", minWidth: 260 }}>
          <div className="row sb t-sm">
            <b>
              {hydrated ? done : 0} of {core.length} done
            </b>
            <span className="mu">{core.length ? Math.round(((hydrated ? done : 0) / core.length) * 100) : 0}%</span>
          </div>
          <Prog value={core.length ? (hydrated ? done : 0) / core.length : 0} style={{ marginTop: 8 }} />
          <div className="t-xs su" style={{ marginTop: 6 }}>
            Saved on this device
          </div>
        </div>
      </div>
      {d.notFit && d.who && (
        <div className="banner info" style={{ marginTop: 16 }}>
          <Icon name="info" />
          <div className="fl1">
            <b>{d.t.tool.name} isn't usually part of a {d.who.label.toLowerCase()}'s work.</b> <span className="mu">Here's the full outline anyway.</span>{" "}
            <Link className="pr b6" to={`/for/${d.who.slug}`}>
              See tools for {d.who.plural} →
            </Link>
          </div>
        </div>
      )}
      {general && (
        <div className="banner info" style={{ marginTop: 16 }} data-da="depth-explainer">
          <Icon name="info" />
          <div className="fl1">
            <b>This is a general guide, not written for your job yet.</b> <span className="mu">Pick a path for your work below, or ask for one so we write it next.</span>
            <div className="row g8 wrapf" style={{ marginTop: 10 }}>
              {d.jobChips.map((j, i) => (
                <Link key={j.slug} className={`chip ${i === 0 ? "sel" : ""}`} to={`/tools/${d.t.tool.slug}/for/${j.slug}`}>
                  {d.t.tool.name} for {j.plural}
                </Link>
              ))}
              <button type="button" className="chip" onClick={() => openSuggest({ reason: "rolepath", on: d.t.tool.name })}>
                <Icon name="plus" /> Ask for my job
              </button>
            </div>
          </div>
        </div>
      )}
      {d.fl && (d.fl.what_is_different || d.fl.why) && (
        <div className="banner info" style={{ marginTop: 16 }}>
          <Icon name="check-circle" />
          <div className="fl1 t-sm">
            <b>Not the generic course.</b> <span className="mu">{d.fl.what_is_different || d.fl.why}</span>
          </div>
        </div>
      )}
      <div className={`grid ${levels.length >= 3 ? "c3" : "c2"}`} style={{ marginTop: 22, alignItems: "start" }}>
        {levels.map((lv) => {
          const mods = d.levels[lv];
          const main = mods.filter((m) => m.relevance !== "also_useful");
          const extra = mods.filter((m) => m.relevance === "also_useful");
          return (
            <div key={lv} className="col g12">
              <div className="row sb">
                <Tag hue={LEVEL_TAG[lv].hue}>{LEVEL_TAG[lv].label}</Tag>
                <span className="t-xs su">
                  {main.length} {main.length === 1 ? "module" : "modules"}
                </span>
              </div>
              {main.map((m) => (
                <ModuleCard key={m.slug} m={m} on={Boolean(mine[m.slug])} feat={m.slug === nextMod?.slug} roadmap={d.rm.slug} hydrated={hydrated} needLabel={d.need ?? undefined} />
              ))}
              {extra.length > 0 && (
                <details>
                  <summary className="t-sm pr b6" style={{ minHeight: 44, display: "flex", alignItems: "center" }}>
                    Also useful ({extra.length})
                  </summary>
                  <div className="col g12">
                    {extra.map((m) => (
                      <ModuleCard key={m.slug} m={m} on={Boolean(mine[m.slug])} roadmap={d.rm.slug} hydrated={hydrated} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 22 }}>
        {nextMod ? (
          <NextStepCard next={{ kicker: `Your next step · Module ${core.indexOf(nextMod) + 1} of ${core.length}`, title: nextMod.title, sub: `${nextMod.hours ? `About ${nextMod.hours} ${nextMod.hours === 1 ? "hour" : "hours"} · ` : ""}practice task included`, url: "#module", cta: "Start module" }} onClick={startModule} />
        ) : (
          <NextStepCard next={{ kicker: "Path complete", title: `Use ${d.t.tool.name} for a real goal`, sub: "See the goals that use this tool", url: `/tools/${d.t.tool.slug}`, cta: "Continue" }} />
        )}
      </div>
    </section>
  );
}

function ModuleCard({ m, on, feat, roadmap, hydrated, needLabel }: { m: ModuleView; on: boolean; feat?: boolean; roadmap: string; hydrated: boolean; needLabel?: string }) {
  return (
    <article id={`mod-${m.slug}`} className={`card pad ${feat ? "el feat" : ""}`} data-da="module-card">
      <div className="row sb">
        <button type="button" className="chk" role="checkbox" aria-checked={on} aria-label={`Mark "${m.title}" done`} disabled={!hydrated} onClick={() => tickActions.set(roadmap, m.slug, !on)}>
          {on && <Icon name="check" />}
        </button>
        {m.hours !== null && (
          <span className="t-xs su row g4">
            <Icon name="clock" /> ≈ {m.hours} h
          </span>
        )}
      </div>
      <div className="b7" style={{ marginTop: 12 }}>
        {m.title}
      </div>
      {m.specific && needLabel && (
        <div style={{ marginTop: 6 }}>
          <span className="tag depth-role">Specific to this work</span>
        </div>
      )}
      {m.outcome && (
        <div className="t-sm mu" style={{ marginTop: 4 }}>
          {m.outcome}
        </div>
      )}
      {m.practice && (
        <div className="row g8 t-xs as" style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "var(--da-color-surface-sunken)" }}>
          <span className="pr">
            <Icon name="hand" />
          </span>
          <span>
            <b>Practice:</b> {m.practice}
          </span>
        </div>
      )}
    </article>
  );
}
