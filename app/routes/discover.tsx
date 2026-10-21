// S03 Discover hub: categories (visible at ≥ 3 published records), sectors, comparisons.
import { Link } from "react-router";
import type { Route } from "./+types/discover";
import { categoriesData, db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { ChipList, PageHeader } from "../components/ui";

export function loader() {
  const D = db();
  return {
    categories: categoriesData().filter((c) => c.visible),
    sectors: D.sectors.map((s) => ({ slug: s.slug, label: s.label })),
    comparisons: D.records.comparisons.map((c) => ({ slug: c.slug, title: c.title })),
  };
}
export const meta: Route.MetaFunction = () => pageMeta("Discover", "Browse by category, task and sector.");

export default function Discover({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <PageHeader title="Discover" lead="Browse by what you want to do, or by the sector you work in." />
      {d.categories.length > 0 && (
        <section className="section">
          <h2>Categories</h2>
          <ul className="sector-cards">
            {d.categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/categories/${c.slug}`} className="sector-card" data-hue={c.hue}>
                  <span>{c.label}</span>
                  <span className="meta">{c.count} tools and how-tos</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="section">
        <h2>Sectors</h2>
        <ChipList items={d.sectors.map((s) => ({ to: `/sectors/${s.slug}`, label: s.label }))} />
      </section>
      <section className="section">
        <h2>Compare</h2>
        <ChipList items={d.comparisons.map((s) => ({ to: `/compare/${s.slug}`, label: s.title }))} />
      </section>
      <section className="section">
        <h2>More ways in</h2>
        <ChipList
          items={[
            { to: "/tasks", label: "How-tos" },
            { to: "/playbooks", label: "Playbooks" },
            { to: "/tools", label: "Tools A–Z" },
            { to: "/skills", label: "Skills" },
            { to: "/who-are-you", label: "Browse everyone" },
          ]}
        />
      </section>
    </div>
  );
}
