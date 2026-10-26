// S01-R Home (reference 01-home, 02-home-picked). Promise H1 (D-104), identity picker, Step 2 need chips,
// desktop photo mosaic, 6 kits, How it works, trust strip.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import { homeData, identitySummary } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { IdentityPicker, type PickedIdentity } from "../components/IdentityPicker";
import { Icon, Picture, ToolLogo, Tag, Tile, NextStepCard } from "../components/da";
import { fetchJson } from "../lib/indexes";
import type { TrendingFile } from "./trending";
import { identityActions, useDevice, useIdentityMemory } from "../lib/store";

export const loader = () => ({ ...homeData(), sample: identitySummary("nurse") });

export const meta: Route.MetaFunction = () => pageMeta("");

interface IdFile {
  identity: { slug: string; label: string };
  resolved: { core: string[]; sector: string[] };
  kits: string[];
}
type Cards = Record<string, { slug: string; label: string }>;

export default function Home({ loaderData: d }: Route.ComponentProps) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mem = useIdentityMemory();
  const dev = useDevice();
  const [sel, setSel] = useState<PickedIdentity[]>([]);
  const [helping, setHelping] = useState(false);
  const [needs, setNeeds] = useState<{ slug: string; label: string }[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);

  // ?roles=nurse,content-creator preselects roles (reference 02).
  useEffect(() => {
    const roles = params.get("roles");
    if (!roles) return;
    Promise.all(roles.split(",").slice(0, 3).map((s) => fetchJson<IdFile>(`/data/id/${s}.json`).catch(() => null))).then((xs) =>
      setSel(xs.filter((x): x is IdFile => Boolean(x)).map((x) => ({ slug: x.identity.slug, label: x.identity.label }))),
    );
  }, [params]);

  // Step 2: needs from the chosen roles' core work.
  useEffect(() => {
    if (!sel.length) return setNeeds([]);
    let live = true;
    Promise.all([fetchJson<Cards>("/data/need-cards.json"), ...sel.map((s) => fetchJson<IdFile>(`/data/id/${s.slug}.json`))]).then(([cards, ...ids]) => {
      if (!live) return;
      const list = [...new Set((ids as IdFile[]).flatMap((x) => x.resolved.core.slice(0, 3)))].slice(0, 6);
      setNeeds(list.map((n) => (cards as Cards)[n]).filter(Boolean));
    });
    return () => {
      live = false;
    };
  }, [sel]);

  const go = () => {
    if (!sel.length) return;
    identityActions.remember(sel);
    const qp = new URLSearchParams();
    if (chosen.length) qp.set("needs", chosen.join(","));
    if (helping) qp.set("helping", "1");
    const q = qp.toString() ? `?${qp}` : "";
    navigate(`/for/${sel.map((s) => s.slug).join("+")}${q}`);
  };
  const continueCard = flag("continue_card") && dev?.last;

  return (
    <>
      <section className="wrap" style={{ paddingTop: "clamp(28px,5vw,64px)" }}>
        <div className="row g32 as" style={{ justifyContent: "space-between" }}>
          <div className="fl1" style={{ maxWidth: 620 }}>
            <span className="chip soft sm">
              <Icon name="sparkles" /> Free · Independent · {d.identityCount.toLocaleString("en-GB")} jobs and roles
            </span>
            <h1 className="t-display" style={{ marginTop: 18 }} data-da="promise">
              Find the tools people in your job use. <span className="hl">Learn them step by step.</span>
            </h1>
            <p className="t-lg mu" style={{ marginTop: 14 }}>
              Tell us what you do. We show the tools that matter for your work, how to learn each one, and your next step.
            </p>
            {mem && mem.slugs.length > 0 && sel.length === 0 && (
              <div className="banner info" style={{ marginTop: 18 }}>
                <Icon name="user" />
                <div className="fl1 t-sm">
                  Welcome back. Continue as <b>{mem.slugs.map((s) => s.label).join(" + ")}</b>?
                  <div className="row g8" style={{ marginTop: 8 }}>
                    <Link className="btn s sm" to={`/for/${mem.slugs.map((s) => s.slug).join("+")}`}>
                      Continue
                    </Link>
                    <button type="button" className="btn g sm" onClick={() => identityActions.forget()}>
                      Not me
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="row sb" style={{ marginTop: 30 }}>
              <span className="t-label">Step 1 · {helping ? "Who are you helping?" : "Who are you?"}</span>
              <span className="row g8 t-sm mu">
                <button type="button" className="sw" role="switch" aria-checked={helping} aria-label="I'm helping someone else" onClick={() => setHelping(!helping)} />
                <span className="desk">I'm helping someone else</span>
                <span className="mob">Helping someone</span>
              </span>
            </div>
            <div style={{ marginTop: 10 }}>
              <IdentityPicker selected={sel} onChange={setSel} examples={d.examples} />
              {sel.length > 0 && needs.length > 0 && (
                <>
                  <div className="t-label" style={{ marginTop: 22 }}>
                    Step 2 · What do you want to get better at?
                  </div>
                  <div className="row g8 wrapf" style={{ marginTop: 10 }}>
                    {needs.map((n) => {
                      const on = chosen.includes(n.slug);
                      return (
                        <button key={n.slug} type="button" className="chip" aria-pressed={on} onClick={() => setChosen(on ? chosen.filter((x) => x !== n.slug) : [...chosen, n.slug])}>
                          {on && <Icon name="check" />} {n.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="row g16 wrapf" style={{ marginTop: 22 }}>
              <a
                className="btn p lg"
                href={sel.length ? `/for/${sel.map((s) => s.slug).join("+")}` : "/for"}
                data-da="primary-cta"
                onClick={(e) => {
                  e.preventDefault();
                  if (sel.length) go();
                  else document.querySelector<HTMLInputElement>("[data-da=identity-picker] input")?.focus();
                }}
              >
                Show {helping ? "their" : "my"} tools <Icon name="arrow-right" />
              </a>
              <Link className="t-sm pr b6" to="/for">
                Browse all jobs →
              </Link>
            </div>
          </div>
          <div className="desk" style={{ flex: "none", width: "min(520px,42vw)" }}>
            <div className="mosaic" data-da="hero-mosaic">
              <div className="m" style={{ left: 0, top: "6%", width: "47%", height: "54%" }}>
                <Picture slug="nurse-tablet" ratio="portrait" priority />
              </div>
              <div className="m" style={{ left: "51%", top: 0, width: "49%", height: "42%" }}>
                <Picture slug="remote-worker" ratio="card" priority />
              </div>
              <div className="m" style={{ left: "51%", top: "46%", width: "49%", height: "54%" }}>
                <Picture slug="farmer-field" ratio="portrait" />
              </div>
              <div className="m" style={{ left: 0, top: "64%", width: "47%", height: "36%" }}>
                <Picture slug="shop-owner" ratio="card" />
              </div>
              <div className="float" style={{ left: "26%", top: "44%", width: 240 }}>
                <div className="row g8">
                  <Tag hue={d.sample.hue} icon={d.sample.icon}>
                    {d.sample.label}
                  </Tag>
                </div>
                <div className="b7" style={{ marginTop: 8 }}>
                  Your tools are ready
                </div>
                <div className="t-xs mu">
                  {d.sample.needs} needs · {d.sample.tools} tools · {d.sample.paths} learning paths
                </div>
                <div className="row g6" style={{ marginTop: 10 }}>
                  {d.sample.logos.map((l) => (
                    <ToolLogo key={l} slug={l} size="sm" />
                  ))}
                  <span className="t-xs su">+{Math.max(0, d.sample.tools - 3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {continueCard && dev?.last && (
        <section className="wrap" style={{ paddingTop: 24 }}>
          <NextStepCard next={{ kicker: "Continue where you left off", title: dev.last.title, sub: dev.last.kicker, url: dev.last.url, cta: "Continue" }} />
        </section>
      )}

      {flag("kits") && (
        <section className="wrap sec">
          <div className="row sb ae">
            <div>
              <span className="t-label">Common situations</span>
              <h2 className="t-h2" style={{ marginTop: 6 }}>
                Or start from what you want to do
              </h2>
            </div>
            <Link className="t-sm pr b6 desk" to="/kits">
              All {d.kitCount} kits →
            </Link>
          </div>
          <div className="grid c3 m2" style={{ marginTop: 18 }}>
            {d.kits.map((k) => (
              <Link key={k.slug} className="card pad col g12" to={`/kits/${k.slug}`} data-da="kit-card" style={{ minWidth: 0 }}>
                <Tile icon={k.icon} hue={k.hue} />
                <span className="b7" style={{ lineHeight: 1.3 }}>
                  {k.title}
                </span>
              </Link>
            ))}
          </div>
          <Link className="t-sm pr b6 mob" to="/kits">
            All {d.kitCount} kits →
          </Link>
          <div className="row g8 wrapf" style={{ marginTop: 16 }}>
            <span className="t-sm mu">Or pick why:</span>
            {d.intents.map((it) => (
              <Link key={it.slug} className="chip sm" to={`/goals?intent=${it.slug}`}>
                <Icon name={it.icon} /> {it.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <TrendingStrip />

      <section className="wrap sec">
        <div className="card pad" style={{ background: "var(--da-color-surface-sunken)", border: 0 }}>
          <div className="grid c3" style={{ gap: 24 }}>
            {[
              ["Tell us what you do", "Up to three roles. Nurse and content creator? Both count."],
              ["See the tools that matter", "Ranked for people in your job, with honest prices."],
              ["Learn, then take the next step", "Short paths with practice tasks, and one clear next step."],
            ].map(([t, s], i) => (
              <div key={t}>
                <div className="t-h1 hl" style={{ fontSize: "2.25rem" }}>
                  {i + 1}
                </div>
                <div className="b7" style={{ marginTop: 6 }}>
                  {t}
                </div>
                <div className="t-sm mu">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 24 }}>
        <div className="banner info" data-da="trust-strip">
          <Icon name="shield-check" />
          <div className="fl1">
            <b>Independent and non-commercial.</b> <span className="mu">No ads, no affiliate links. Every tool shows its price, when we last checked it, or a clear Preview label.</span>
          </div>
          <Link className="t-sm pr b6" to="/about/how-we-review">
            How we review →
          </Link>
        </div>
      </section>
    </>
  );
}

/** Trending strip on home (doc 24 §10): top 3 goals this week. Sample numbers until real opt-in counts exist. */
function TrendingStrip() {
  const [t, setT] = useState<TrendingFile | null>(null);
  const dev = useDevice();
  useEffect(() => {
    fetchJson<TrendingFile>("/data/trending.json").then(setT, () => setT(null));
  }, []);
  const m = dev?.market === "africa" ? "africa" : dev?.market === "other" ? "all" : "ng";
  const rows = t?.markets[m].goals.slice(0, 3) ?? [];
  if (!rows.length) return null;
  return (
    <section className="wrap sec">
      <div className="row sb ae">
        <div>
          <span className="t-label">Trending this week{t?.demo ? " · sample data" : ""}</span>
          <h2 className="t-h2" style={{ marginTop: 6 }}>
            What people are working on
          </h2>
        </div>
        <Link className="t-sm pr b6" to="/trending">
          See trending →
        </Link>
      </div>
      <div className="card" style={{ marginTop: 14, padding: "4px 20px" }}>
        <div className="list">
          {rows.map((g, i) => (
            <Link key={g.slug} className="li" to={`/goals/${g.slug}`}>
              <span className="t-h3" style={{ width: 28, color: "var(--da-color-primary)" }}>
                {i + 1}
              </span>
              <span className="fl1">
                <span className="b7 t-sm">{g.label}</span>
                <span className="t-xs su" style={{ display: "block" }}>
                  {g.group}
                </span>
              </span>
              <Icon name="chevron-right" className="cr" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
