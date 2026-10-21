// S12 Playbook index.
import { Link } from "react-router";
import type { Route } from "./+types/playbooks";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { PageHeader } from "../components/ui";

export function loader() {
  return { items: db().records.playbooks.map((p) => ({ slug: p.slug, title: p.title, summary: p.outcome, time: p.estimated_duration?.label })) };
}
export const meta: Route.MetaFunction = () => pageMeta("Playbooks", "Longer, multi-tool workflows from start to finish.");

export default function Playbooks({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <PageHeader title="Playbooks" lead="Longer workflows that combine several tools, from start to a finished result." />
      <ul className="card-grid">
        {d.items.map((t) => (
          <li key={t.slug} className="card card-link">
            <h3>
              <Link to={`/playbooks/${t.slug}`}>{t.title}</Link>
            </h3>
            <p className="meta">{t.summary}</p>
            {t.time && <p className="meta">{t.time}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
