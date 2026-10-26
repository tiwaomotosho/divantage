// S27 Identity page (reference 04-identity): role header with photo, ISCO and review status, tabs,
// feedback explainer, need cards with DepthLabel and 👍/👎 (D-102), NextStepCard. Combined /for/a+b in the browser.
import { useMemo, useState } from "react";
import { Link, data, useSearchParams } from "react-router";
import type { Route } from "./+types/for.$identity";
import { toolkitData, type NeedCardData, type ToolkitData } from "~/lib/content.server";
import { BRAND, flag, meta as pageMeta } from "../lib/build";
import { fetchJson } from "../lib/indexes";
import { Crumbs, DepthLabel, Icon, NextStepCard, Picture, StarButton, Tag, Tile, ToolLogo, ToolRowCard, toast } from "../components/da";
import { helperActions, sessionHidden, setSessionHidden, useHydrated } from "../lib/store";

export function loader({ params }: Route.LoaderArgs) {
  const d = toolkitData(params.identity);
  if (!d) throw data("Not found", { status: 404 });
  return { kind: "single" as const, ...d };
}

interface IdFile {
  identity: { slug: string; label: string; plural: string; pluralTitle: string };
  resolved: { core: string[]; sector: string[]; universal: string[] };
}

export async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {
  if (!params.identity.includes("+")) return serverLoader();
  const slugs = [...new Set(params.identity.split("+"))].slice(0, 3);
  try {
    const [cards, ...ids] = await Promise.all([fetchJson<Record<string, NeedCardData>>("/data/need-cards.json"), ...slugs.map((s) => fetchJson<IdFile>(`/data/id/${s}.json`))]);
    const all = [...new Set(ids.flatMap((x) => [...x.resolved.core, ...x.resolved.sector]))];
    return { kind: "combined" as const, members: ids.map((x) => x.identity), needs: all.map((n) => cards[n]).filter(Boolean) };
  } catch {
    throw data("Not found", { status: 404 });
  }
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <section className="wrap" style={{ paddingTop: 28 }} aria-busy="true" aria-label="Loading">
      <div className="sk" style={{ height: 40, width: "50%" }} />
      <div className="sk" style={{ height: 200, marginTop: 24 }} />
    </section>
  );
}

export const meta: Route.MetaFunction = ({ data: d }) => {
  if (!d) return pageMeta("Not found");
  if (d.kind === "combined") return pageMeta(`Tools for ${d.members.map((m) => m.plural).join(" and ")}`, undefined, { noindex: true });
  return [{ title: `Tools for ${d.identity.plural} — ${BRAND}` }, ...pageMeta("", `The tools ${d.identity.plural} use, and how to learn each one, step by step.`).slice(1)];
};

const TABS = ["Needs", "Goals", "Tools", "Learning paths"] as const;

export default function IdentityPage({ loaderData: d }: Route.ComponentProps) {
  if (d.kind === "combined") return <Combined d={d} />;
  return <Single d={d} />;
}

function NeedCard({ n, idSlug, plural }: { n: NeedCardData; idSlug?: string; plural?: string }) {
  const hydrated = useHydrated();
  const key = `${idSlug ?? "x"}:${n.slug}`;
  const [hidden, setHidden] = useState(false);
  const [vote, setVote] = useState<"up" | null>(null);
  if (hidden || (hydrated && sessionHidden(key))) return null;
  return (
    <article className="card pad el col" data-da="need-card">
      <div className="row sb">
        <Tile icon={n.tile.icon} hue={n.tile.hue} />
        <DepthLabel depth={n.depth.kind === "role" && plural ? { kind: "role", label: `For ${plural}` } : n.depth} icon />
      </div>
      <div className="b7" style={{ marginTop: 14, fontSize: "1.0625rem" }}>
        {n.label}
      </div>
      <div className="row g6" style={{ marginTop: 12 }}>
        {n.logos.map((l) => (
          <ToolLogo key={l} slug={l} size="sm" />
        ))}
        {n.more > 0 && (
          <span className="t-xs su" style={{ marginLeft: 4 }}>
            +{n.more} tools
          </span>
        )}
      </div>
      <div className="hr" style={{ margin: "14px 0 10px" }} />
      <div className="row sb t-sm">
        <Link className="pr b6" to={`/needs/${n.slug}`}>
          See tools →
        </Link>
        {flag("need_feedback") && (
          <span className="row g6 su t-xs" data-da="need-feedback">
            {vote ? "Thanks" : "Right for your work?"}
            <button type="button" className="chip sm" aria-label="Yes, this fits" aria-pressed={vote === "up"} onClick={() => setVote("up")}>
              <Icon name="thumbs-up" />
            </button>
            <button
              type="button"
              className="chip sm"
              aria-label="Not my work"
              onClick={() => {
                setSessionHidden(key, true);
                setHidden(true);
                toast(`Hidden for this visit: ${n.label}.`, {
                  label: "Undo",
                  run: () => {
                    setSessionHidden(key, false);
                    setHidden(false);
                  },
                });
              }}
            >
              <Icon name="thumbs-down" />
            </button>
          </span>
        )}
      </div>
    </article>
  );
}

function Single({ d }: { d: ToolkitData }) {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Needs");
  const [all, setAll] = useState(false);
  const focus = params.get("needs")?.split(",") ?? [];
  const needs = useMemo(() => [...d.needs.filter((n) => focus.includes(n.slug)), ...d.needs.filter((n) => !focus.includes(n.slug))], [d.needs, focus]);
  const kindLabel = d.identity.kind === "life_role" ? "Life role" : d.parent ? "Specialism" : "Profession";
  return (
    <>
      <section style={{ background: `linear-gradient(180deg,var(--da-hue-${d.sector.hue}-bg),var(--da-color-canvas))` }}>
        <div className="wrap" style={{ paddingTop: 24, paddingBottom: 26 }}>
          <Crumbs items={[{ to: "/for", label: "Explore" }, { to: `/sectors/${d.sector.slug}`, label: d.sector.label }, ...(d.parent ? [{ to: `/for/${d.parent.slug}`, label: d.parent.label }] : d.family ? [{ label: d.family.label }] : [])]} />
          <div className="row sb ae wrapf g16" style={{ marginTop: 14 }}>
            <div className="row g16">
              <div className="photo" style={{ width: 84, height: 84, borderRadius: 24, flex: "none" }}>
                <Picture slug={d.photo} ratio="square" sizes="84px" priority />
              </div>
              <div>
                <div className="row g6 wrapf">
                  <Tag hue={d.sector.hue}>{kindLabel}</Tag>
                  {d.identity.isco && <Tag hue="slate">ISCO-08 {d.identity.isco}</Tag>}
                  <Tag hue="amber" icon="clock">
                    Expert review {d.identity.validation === "validated" ? "done" : "pending"}
                  </Tag>
                </div>
                <h1 className="t-h1" style={{ marginTop: 8 }}>
                  Tools for {d.identity.plural}
                </h1>
                {d.identity.aliases.length > 0 && <div className="t-sm mu">Also: {d.identity.aliases.join(" · ")}</div>}
              </div>
            </div>
            <div className="row g10">
              <StarButton item={{ type: "role", slug: d.identity.slug, label: d.identity.label }} />
              {d.helper ? (
                <Link className="btn p desk" to={`/helpers/${d.helper.slug}`} onClick={() => helperActions.start(d.helper!.slug)}>
                  <Icon name="route" /> Follow the {d.helper.title.replace(/^The /, "")}
                </Link>
              ) : (
                <Link className="btn p desk" to={d.next.url}>
                  <Icon name="route" /> Start my path
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="wrap">
        <div className="row g8 wrapf" style={{ margin: "4px 0 20px" }}>
          <div className="seg" role="tablist" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {tab === "Needs" && (
          <>
            {flag("need_feedback") && (
              <div className="banner info" style={{ marginBottom: 16 }} data-da="feedback-explainer">
                <Icon name="info" />
                <div className="fl1 t-sm">Tell us if a need isn't part of your work. We use your answers to make this list fit {d.identity.plural} better.</div>
              </div>
            )}
            <div className="grid c3">
              {(all ? needs : needs.slice(0, 6)).map((n) => (
                <NeedCard key={n.slug} n={n} idSlug={d.identity.slug} plural={d.identity.plural} />
              ))}
            </div>
            {needs.length > 6 && !all && (
              <button type="button" className="btn s" style={{ marginTop: 16 }} onClick={() => setAll(true)}>
                See all {needs.length} needs
              </button>
            )}
          </>
        )}
        {tab === "Goals" && (
          <div className="col g12">
            {d.goals.map((g) => (
              <Link key={g.slug} className="card pad row g16" to={`/goals/${g.slug}`} data-da="goal-row">
                <Tile icon="target" hue="violet" />
                <div className="fl1">
                  <div className="b7">{g.label}</div>
                  <div className="row g6 wrapf" style={{ marginTop: 6 }}>
                    <Tag hue="teal">{g.need}</Tag>
                    {g.safety && (
                      <Tag hue="amber" icon="shield">
                        Safety tips
                      </Tag>
                    )}
                  </div>
                </div>
                <span className="row g4 desk">
                  {g.logos.map((l) => (
                    <ToolLogo key={l} slug={l} size="sm" />
                  ))}
                </span>
                <Icon name="chevron-right" />
              </Link>
            ))}
          </div>
        )}
        {tab === "Tools" && (
          <div className="col g12">
            {d.tools.slice(0, 6).map((t, i) => (
              <ToolRowCard key={t.slug} t={t} rank={i + 1} top={i === 0} />
            ))}
          </div>
        )}
        {tab === "Learning paths" && (
          <div className="col g10">
            {d.paths.map((p) => (
              <Link key={p.url} className="card pad row g12" to={p.url} data-da="path-card" style={{ padding: "14px 16px" }}>
                <ToolLogo slug={p.tool} size="sm" />
                <div className="fl1">
                  <div className="b7 t-sm">{p.title}</div>
                </div>
                <DepthLabel depth={p.depth} />
              </Link>
            ))}
          </div>
        )}
        <ToolkitCard d={d} helping={params.get("helping") === "1"} />
        <div style={{ marginTop: 24 }}>
          <NextStepCard next={d.next} />
        </div>
      </section>
    </>
  );
}

/** Toolkit card (06 §11, F-07/F-18): printable and shareable, for helping family and friends. */
function ToolkitCard({ d, helping }: { d: ToolkitData; helping: boolean }) {
  const rows = d.needs.slice(0, 6);
  const NL = String.fromCharCode(10);
  const text = `Tools for ${d.identity.plural}:${NL}${rows.map((r) => `• ${r.label}`).join(NL)}`;
  return (
    <section className="card pad" style={{ marginTop: 24 }} data-da="toolkit-card">
      <div className="row sb wrapf g8">
        <div>
          <span className="t-label">{helping ? "You're helping someone" : "Helping someone?"}</span>
          <h2 className="t-h3" style={{ marginTop: 4 }}>
            Share this with a {d.identity.label.toLowerCase()} you know
          </h2>
        </div>
        <div className="row g8 wrapf">
          <a className="btn s sm" href={`https://wa.me/?text=${encodeURIComponent(text + NL + (typeof location !== "undefined" ? location.href.split("?")[0] : ""))}`} target="_blank" rel="noopener noreferrer">
            <Icon name="message" /> WhatsApp
          </a>
          <button
            type="button"
            className="btn s sm"
            onClick={async () => {
              try {
                if (navigator.share) await navigator.share({ title: `Tools for ${d.identity.plural}`, text, url: location.href.split("?")[0] });
                else {
                  await navigator.clipboard.writeText(location.href.split("?")[0]);
                  toast("Link copied.");
                }
              } catch {
                /* cancelled */
              }
            }}
          >
            <Icon name="share" /> Share
          </button>
          <button type="button" className="btn g sm" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
      <div className="grid c3" style={{ marginTop: 12 }}>
        {rows.map((r) => (
          <div key={r.slug} className="row g10 t-sm">
            <Tile icon={r.tile.icon} hue={r.tile.hue} size="sm" />
            <span className="fl1">
              <b>{r.label}</b>
              <span className="su"> · {r.logos.length + r.more} tools</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Combined({ d }: { d: Extract<Route.ComponentProps["loaderData"], { kind: "combined" }> }) {
  const names = d.members.map((m) => m.plural);
  const first = d.members[0];
  return (
    <section className="wrap" style={{ paddingTop: 24 }}>
      <Crumbs items={[{ to: "/for", label: "Explore" }, { label: d.members.map((m) => m.label).join(" + ") }]} />
      <h1 className="t-h1" style={{ marginTop: 12 }}>
        Tools for {names.join(" and ")}
      </h1>
      <div className="row g8 wrapf" style={{ marginTop: 10 }}>
        {d.members.map((m) => (
          <Link key={m.slug} className="chip sm" to={`/for/${m.slug}`}>
            Only {m.plural}
          </Link>
        ))}
      </div>
      <div className="grid c3" style={{ marginTop: 20 }}>
        {d.needs.slice(0, 9).map((n) => (
          <NeedCard key={n.slug} n={n} idSlug={d.members.map((m) => m.slug).join("+")} />
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <NextStepCard next={{ kicker: "Your next step", title: `See the full toolkit for ${first.plural}`, sub: "Needs, goals, tools and learning paths", url: `/for/${first.slug}`, cta: "Open" }} />
      </div>
    </section>
  );
}
