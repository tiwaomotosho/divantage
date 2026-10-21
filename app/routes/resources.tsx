// S10 Resource index.
import { Link } from "react-router";
import type { Route } from "./+types/resources";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { PageHeader } from "../components/ui";

export function loader() {
  return {
    items: db()
      .records.resources.map((r) => ({ slug: r.slug, title: r.title, summary: r.summary, publisher: r.publisher }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  };
}
export const meta: Route.MetaFunction = () => pageMeta("Learning resources", "Official documentation and free courses we have checked.");

export default function Resources({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <PageHeader title="Learning resources" lead="Official documentation and free courses, checked and linked at the source." />
      <ul className="card-grid">
        {d.items.map((t) => (
          <li key={t.slug} className="card card-link">
            <h3>
              <Link to={`/resources/${t.slug}`}>{t.title}</Link>
            </h3>
            <p className="meta">{t.publisher}</p>
            <p className="meta">{t.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
