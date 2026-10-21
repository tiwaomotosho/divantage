// S08 Tool directory A–Z (client filter; the full list works without JavaScript).
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/tools";
import { toolsDirectory } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Monogram, PageHeader } from "../components/ui";

export const loader = () => ({ tools: toolsDirectory() });
export const meta: Route.MetaFunction = () => pageMeta("Tools A–Z", "Every tool in the catalogue, each with a beginner-to-expert course outline.");

const letterOf = (name: string) => (/[a-z]/i.test(name[0]) ? name[0].toUpperCase() : "#");

export default function Tools({ loaderData: d }: Route.ComponentProps) {
  const [q, setQ] = useState("");
  const list = useMemo(() => (q ? d.tools.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())) : d.tools), [q, d.tools]);
  const letters = [...new Set(list.map((t) => letterOf(t.name)))];
  return (
    <div className="container">
      <PageHeader title="Tools A–Z" lead={`${d.tools.length} tools, sorted A–Z. This is not a quality ranking.`} />
      <div className="field filter-field">
        <label className="label" htmlFor="tool-filter">
          Filter tools
        </label>
        <input id="tool-filter" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name" />
      </div>
      <nav aria-label="Jump to letter" className="az-nav">
        {letters.map((l) => (
          <a key={l} href={`#l-${l}`}>
            {l}
          </a>
        ))}
      </nav>
      {letters.map((l) => (
        <section key={l} id={`l-${l}`} className="az-group">
          <h2>{l}</h2>
          <ul className="az-list">
            {list
              .filter((t) => letterOf(t.name) === l)
              .map((t) => (
                <li key={t.slug}>
                  <Monogram name={t.name} hue={t.hue} size={32} />
                  <Link to={`/tools/${t.slug}`}>{t.name}</Link>
                  {t.guide && <span className="badge badge-starts badge-xs">Guide</span>}
                </li>
              ))}
          </ul>
        </section>
      ))}
      {list.length === 0 && <p>No tools match "{q}". Try fewer letters.</p>}
    </div>
  );
}
