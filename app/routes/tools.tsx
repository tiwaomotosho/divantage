// S08 Tools. Composed from 05-browse: filter, segmented views (By category / A–Z), category cards, lists with price.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tools";
import { db, toolsDirectory } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Icon, Tile, ToolLogo } from "../components/da";

// categories.json uses a few icon names outside the closed set; map them to the nearest asset icon (D-096).
const ICON_MAP: Record<string, string> = { clapperboard: "video", "audio-lines": "music", "pen-line": "pen-tool", "chart-column": "chart", "graduation-cap": "graduation", "badge-check": "award", workflow: "zap", house: "home", rocket: "sparkles" };

export function loader() {
  const D = db();
  const tools = toolsDirectory();
  const bySlug = new Map(D.registry.map((r) => [r.slug, r.category_id ?? "other"]));
  const cats = D.categories
    .map((c) => ({ slug: c.slug, label: c.label, hue: D.visuals.tool_categories[c.slug]?.hue ?? c.hue ?? "slate", icon: ICON_MAP[c.icon] ?? c.icon ?? "grid", tools: tools.filter((t) => bySlug.get(t.slug) === c.slug || bySlug.get(t.slug) === c.id) }))
    .filter((c) => c.tools.length);
  return { tools, cats };
}
export const meta: Route.MetaFunction = () => pageMeta("Tools A–Z", "Every tool, each with a learning path and an honest price label.");

const letterOf = (n: string) => (/[a-z]/i.test(n[0]) ? n[0].toUpperCase() : "#");

export default function Tools({ loaderData: d }: Route.ComponentProps) {
  const [view, setView] = useState<"cat" | "az">("cat");
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState("A");
  const lq = q.trim().toLowerCase();
  const letters = useMemo(() => [...new Set(d.tools.map((t) => letterOf(t.name)))], [d.tools]);
  const current = d.cats.find((c) => c.slug === cat);
  const list = lq ? d.tools.filter((t) => t.name.toLowerCase().includes(lq)).slice(0, 80) : current ? current.tools : d.tools.filter((t) => letterOf(t.name) === letter);
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">Tools</span>
      <h1 className="t-h1" style={{ marginTop: 6 }}>
        {d.tools.length.toLocaleString("en-GB")} tools
      </h1>
      <p className="mu" style={{ marginTop: 6 }}>
        Each with a learning path and an honest price label. Sorted A–Z; this is not a quality ranking.
      </p>
      <label className="input" style={{ marginTop: 20 }}>
        <Icon name="search" />
        <input placeholder="Filter tools, e.g. Canva" aria-label="Filter tools" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {!lq && (
        <div className="row g8 wrapf" style={{ marginTop: 12 }}>
          <div className="seg" role="tablist" aria-label="Browse by">
            <button type="button" role="tab" aria-selected={view === "cat"} onClick={() => setView("cat")}>
              By category
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "az"}
              onClick={() => {
                setView("az");
                setCat(null);
              }}
            >
              A–Z
            </button>
          </div>
        </div>
      )}
      {!lq && view === "cat" && !current && (
        <div className="grid c4" style={{ marginTop: 18 }}>
          {d.cats.map((c) => (
            <button key={c.slug} type="button" className="card pad row g12" style={{ padding: 16, textAlign: "left" }} onClick={() => setCat(c.slug)}>
              <Tile icon={c.icon} hue={c.hue} />
              <div className="fl1">
                <div className="b7 t-sm">{c.label}</div>
                <div className="t-xs su">{c.tools.length} tools</div>
              </div>
              <Icon name="chevron-right" />
            </button>
          ))}
        </div>
      )}
      {!lq && view === "az" && (
        <div className="row g6 wrapf" style={{ marginTop: 12 }} role="tablist" aria-label="Letter">
          {letters.map((l) => (
            <button key={l} type="button" role="tab" aria-selected={l === letter} className={`chip sm ${l === letter ? "on" : ""}`} onClick={() => setLetter(l)}>
              {l}
            </button>
          ))}
        </div>
      )}
      {(lq || view === "az" || current) && (
        <>
          {current && !lq && (
            <div className="row g10" style={{ marginTop: 16 }}>
              <button type="button" className="chip sm" onClick={() => setCat(null)}>
                <Icon name="arrow-left" /> All categories
              </button>
              <span className="b7">{current.label}</span>
            </div>
          )}
          <div className="card" style={{ marginTop: 16, padding: "4px 20px" }}>
            <div className="list">
              {list.map((t) => (
                <Link key={t.slug} className="li" to={`/tools/${t.slug}`}>
                  <ToolLogo slug={t.slug} size="sm" />
                  <span className="t-sm b6 fl1">{t.name}</span>
                  <span className="t-xs su">{t.price}</span>
                  <Icon name="chevron-right" className="cr" />
                </Link>
              ))}
              {list.length === 0 && <div className="li t-sm mu">No tools match "{q}".</div>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
