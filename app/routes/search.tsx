// S51 Search (reference 03-search, 27-no-results): natural-language field ("I want to…"), type filters,
// market, kit best match first, goal rows, tools, "We understood", safety note for job and money queries.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/search";
import { cleanGoalQuery } from "~/lib/search";
import { MARKET_LABEL } from "~/lib/view";
import { meta as pageMeta } from "../lib/build";
import { loadContentSearch, loadGoalSearch, loadIdentitySearch, useLazy } from "../lib/indexes";
import { EmptyState, Icon, Picture, Tag, Tile, ToolLogo } from "../components/da";
import { deviceActions, useDevice } from "../lib/store";

export const meta: Route.MetaFunction = () => pageMeta("Search", undefined, { noindex: true });

type Filter = "all" | "kits" | "goals" | "tools";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";
  const [text, setText] = useState(q);
  const [filter, setFilter] = useState<Filter>("all");
  const [pickMarket, setPickMarket] = useState(false);
  const dev = useDevice();
  const market = dev?.market ?? "ng";
  const goals = useLazy(loadGoalSearch, true);
  const content = useLazy(loadContentSearch, Boolean(q));
  const ids = useLazy(loadIdentitySearch, Boolean(q));
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setText(q), [q]);
  useEffect(() => {
    if (!q) input.current?.focus();
  }, [q]);

  const r = useMemo(() => {
    if (!q || goals.status !== "ready") return null;
    const hits = goals.value!.search(q, market === "other" ? undefined : market);
    // Only words that all match count as an answer (27-no-results): partial matches would mislead.
    if (hits.weak) return { kits: [], goals: [], tools: [], people: [], safety: null };
    const kits = hits.filter((h) => h.doc.id.startsWith("kit:")).slice(0, 2);
    const gl = hits.filter((h) => !h.doc.id.startsWith("kit:")).slice(0, 14);
    const tools = content.status === "ready" ? content.value!(cleanGoalQuery(q)).results.filter((x) => x.type === "tool").slice(0, 8) : [];
    const people = ids.status === "ready" ? ids.value!(cleanGoalQuery(q), 2).filter((p) => p.score > 1e5) : [];
    const tags = [...new Set(gl.slice(0, 4).flatMap((g) => goals.value!.file.goalTags[g.doc.id] ?? []))];
    const safeTag = ["jobs", "money", "kids"].find((t) => tags.includes(t));
    return { kits, goals: gl, tools, people, safety: safeTag ? goals.value!.file.safety[safeTag] : null };
  }, [q, goals, content, ids, market]);

  const submit = (v: string) => {
    const p = new URLSearchParams();
    if (v.trim()) p.set("q", v.trim().slice(0, 120));
    setParams(p);
  };
  const total = r ? r.kits.length + r.goals.length + r.tools.length : 0;
  const topKit = r?.kits[0];
  const bestKit = topKit && goals.status === "ready" ? goals.value!.file.kits[topKit.doc.id.slice(4)] : null;
  const outcome = cleanGoalQuery(q);
  const show = (f: Filter) => filter === "all" || filter === f;

  return (
    <>
      <section className="wrap" style={{ paddingTop: 24 }}>
        <form
          role="search"
          action="/search"
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            submit(text);
          }}
        >
          <label className="input" style={{ minHeight: 64, borderRadius: 20, fontSize: "1.125rem" }} data-da="nl-search">
            <Icon name="search" />
            <span className="su" aria-hidden="true">
              I want to
            </span>
            <input ref={input} name="q" type="search" style={{ minWidth: 0 }} aria-label="I want to…" placeholder="get a remote job, edit a video, sell online" value={text} maxLength={120} onChange={(e) => setText(e.target.value)} />
            {text && (
              <button
                type="button"
                className="ib"
                style={{ border: 0, background: "transparent" }}
                aria-label="Clear search"
                onClick={() => {
                  setText("");
                  submit("");
                }}
              >
                <Icon name="x" />
              </button>
            )}
          </label>
        </form>
        {r && total > 0 && (
          <div className="row g8 wrapf" style={{ marginTop: 12 }}>
            {(
              [
                ["all", `All ${total}`],
                ["kits", `Kits ${r.kits.length}`],
                ["goals", `Goals ${r.goals.length}`],
                ["tools", `Tools ${r.tools.length}`],
              ] as [Filter, string][]
            ).map(([f, l]) => (
              <button key={f} type="button" className={`chip ${filter === f ? "on" : ""}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {l}
              </button>
            ))}
            <span className="fl1" />
            <span className="t-sm mu">
              For <b className="pr">{market === "other" ? "other countries" : MARKET_LABEL[market]}</b> ·{" "}
              <button type="button" className="pr b6" style={{ minHeight: 24 }} onClick={() => setPickMarket(!pickMarket)}>
                Change
              </button>
            </span>
          </div>
        )}
        {pickMarket && (
          <div className="seg" style={{ marginTop: 10 }} role="tablist" aria-label="Your country">
            {(["ng", "africa", "other"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={market === m}
                onClick={() => {
                  deviceActions.setMarket(m);
                  setPickMarket(false);
                }}
              >
                {m === "other" ? "Other country" : MARKET_LABEL[m]}
              </button>
            ))}
          </div>
        )}
        {!q && (
          <p className="t-sm mu" style={{ marginTop: 16 }}>
            Type what you want to get done in your own words. We match kits first, then goals, then tools.
          </p>
        )}
        {q && goals.status === "loading" && <div className="sk" style={{ height: 200, marginTop: 22 }} />}
        {r && total > 0 && (
          <div className="rail" style={{ marginTop: 22 }}>
            <div className="col g12">
              {topKit && bestKit && show("kits") && (
                <Link className="card el feat row g16" to={`/kits/${topKit.doc.id.slice(4)}`} style={{ padding: 16 }} data-da="best-match">
                  <div className="photo desk" style={{ width: 160, height: 110, flex: "none", borderRadius: 14 }}>
                    <Picture slug={bestKit.photo ?? "remote-worker"} ratio="card" className="" sizes="160px" />
                  </div>
                  <div className="fl1">
                    <div className="row g8">
                      <Tag hue="violet" icon="layers">
                        Kit
                      </Tag>
                      <span className="t-xs su">Best match</span>
                    </div>
                    <div className="t-h3" style={{ marginTop: 8 }}>
                      {bestKit.title}
                    </div>
                    <div className="t-sm mu">
                      {bestKit.promise} {bestKit.steps} steps.
                    </div>
                  </div>
                  <span className="btn p sm desk">
                    Open kit <Icon name="arrow-right" />
                  </span>
                </Link>
              )}
              {r.kits.slice(1).filter(() => show("kits")).map((k) => (
                <Link key={k.doc.id} className="card pad row g16" to={`/kits/${k.doc.id.slice(4)}`}>
                  <Tile icon="layers" hue="violet" />
                  <div className="fl1 b7">{k.doc.label}</div>
                  <Icon name="chevron-right" />
                </Link>
              ))}
              {r.people.length > 0 && filter === "all" && (
                <div className="row g8 wrapf">
                  {r.people.map((p) => (
                    <Link key={p.slug} className="chip sel" to={`/for/${p.slug}`}>
                      <Icon name="user" /> Tools for {p.label.toLowerCase()}
                    </Link>
                  ))}
                </div>
              )}
              {show("goals") && r.goals.length > 0 && (
                <>
                  <div className="t-label" style={{ marginTop: 12 }}>
                    Goals
                  </div>
                  {r.goals.slice(0, filter === "goals" ? 14 : 6).map((g) => (
                    <Link key={g.doc.id} className="card pad row g16" to={`/goals/${g.doc.id}`} data-da="goal-row">
                      <Tile icon="target" hue="violet" />
                      <div className="fl1">
                        <div className="b7">{g.doc.label}</div>
                        <div className="row g6 wrapf" style={{ marginTop: 6 }}>
                          <Tag hue="teal">{g.doc.need}</Tag>
                          {g.doc.safety && (
                            <Tag hue="amber" icon="shield">
                              Safety tips
                            </Tag>
                          )}
                        </div>
                      </div>
                      <span className="row g4 desk">
                        {g.doc.logos.map((l) => (
                          <ToolLogo key={l} slug={l} size="sm" />
                        ))}
                      </span>
                      <Icon name="chevron-right" />
                    </Link>
                  ))}
                </>
              )}
              {show("tools") && r.tools.length > 0 && (
                <>
                  <div className="t-label" style={{ marginTop: 12 }}>
                    Tools
                  </div>
                  <div className="card" style={{ padding: "4px 20px" }}>
                    <div className="list">
                      {r.tools.slice(0, filter === "tools" ? 8 : 4).map((t) => (
                        <Link key={t.id} className="li" to={t.url}>
                          <ToolLogo slug={t.url.split("/").pop()!} size="sm" />
                          <span className="fl1">
                            <span className="t-sm b6">{t.title}</span>
                            {t.summary && (
                              <span className="t-xs su" style={{ display: "block" }}>
                                {t.summary.slice(0, 110)}
                                {t.summary.length > 110 ? "…" : ""}
                              </span>
                            )}
                          </span>
                          <Icon name="chevron-right" className="cr" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <aside className="col g16">
              <div className="card pad">
                <div className="t-label">We understood</div>
                <div className="col g8 t-sm" style={{ marginTop: 10 }}>
                  <div className="row sb g8">
                    <span className="mu">Outcome</span>
                    <b style={{ textAlign: "right" }}>{outcome}</b>
                  </div>
                  <div className="row sb">
                    <span className="mu">Market</span>
                    <b>{market === "other" ? "Other country" : MARKET_LABEL[market]}</b>
                  </div>
                </div>
              </div>
              {r.safety && (
                <div className="safe" data-da="safety-note">
                  <div className="hd">
                    <Icon name="shield" /> {r.safety.label}
                  </div>
                  <div className="bd">{r.safety.what}</div>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
      {r && total === 0 && (
        <EmptyState
          illustration="no-results"
          title="No digital tools for this yet"
          body="We cover how technology helps your work. Try different words, or tell us what you needed so we can add it."
          actions={
            <>
              <button type="button" className="btn p blk" onClick={() => navigate(`/suggest?type=suggest_tool`)}>
                Tell us what you needed
              </button>
              <Link className="btn s blk" to="/goals">
                Browse goals
              </Link>
            </>
          }
        />
      )}
      {goals.status === "error" && (
        <EmptyState
          illustration="offline"
          title="Search isn't loading"
          body="Check your connection and try again. You can still browse goals and kits."
          actions={
            <>
              <button type="button" className="btn p blk" onClick={() => location.reload()}>
                Try again
              </button>
              <Link className="btn s blk" to="/goals">
                Browse goals
              </Link>
            </>
          }
          h1={false}
        />
      )}
      {!(r && total === 0) && <h1 className="t-h1 sr">Search</h1>}
    </>
  );
}
