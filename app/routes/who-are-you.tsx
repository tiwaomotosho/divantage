// S33 Browse everyone: static, grouped sector → family → identity (works without JS); filter enhanced with JS.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/who-are-you";
import { browseData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { PageHeader } from "../components/ui";

export const loader = () => browseData();
export const meta: Route.MetaFunction = () => pageMeta("Who are you?", "Every profession and life role, grouped by sector.");

export default function WhoAreYou({ loaderData: d }: Route.ComponentProps) {
  const [q, setQ] = useState("");
  const lq = q.trim().toLowerCase();
  const sectors = useMemo(() => {
    if (!lq) return d.sectors;
    return d.sectors
      .map((s) => ({
        ...s,
        families: s.families
          .map((f) => ({
            ...f,
            identities: f.identities
              .map((i) => ({ ...i, children: i.children.filter((c) => c.label.toLowerCase().includes(lq)) }))
              .filter((i) => i.label.toLowerCase().includes(lq) || i.children.length),
          }))
          .filter((f) => f.identities.length),
      }))
      .filter((s) => s.families.length);
  }, [lq, d.sectors]);
  return (
    <div className="container">
      <PageHeader title="Who are you?" lead="Find your work or role. Every one has a toolkit." />
      <div className="field filter-field">
        <label className="label" htmlFor="who-filter">
          Filter the list
        </label>
        <input id="who-filter" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. engineer, teacher, rider" />
      </div>
      <nav aria-label="Jump to sector" className="az-nav az-nav-wrap">
        {sectors.map((s) => (
          <a key={s.slug} href={`#s-${s.slug}`}>
            {s.label}
          </a>
        ))}
      </nav>
      {sectors.map((s) => (
        <section key={s.slug} id={`s-${s.slug}`} className="section browse-sector">
          <h2>
            <Link to={`/sectors/${s.slug}`}>{s.label}</Link>
          </h2>
          <div className="browse-families">
            {s.families.map((f) => (
              <div key={f.slug} className="browse-family">
                <h3 className="h4">{f.label}</h3>
                <ul>
                  {f.identities.map((i) => (
                    <li key={i.slug}>
                      <Link to={`/for/${i.slug}`}>{i.label}</Link>
                      {i.children.length > 0 && (
                        <ul className="browse-children">
                          {i.children.map((c) => (
                            <li key={c.slug}>
                              <Link to={`/for/${c.slug}`}>{c.label}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
      {sectors.length === 0 && (
        <p>
          Nothing matches "{q}". <Link to={`/suggest?type=suggest_identity`}>Tell us your work</Link> and we'll add it.
        </p>
      )}
    </div>
  );
}
