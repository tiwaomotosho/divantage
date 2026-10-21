// S05 Task index, grouped by task family.
import { Link } from "react-router";
import type { Route } from "./+types/tasks";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { PageHeader } from "../components/ui";

export function loader() {
  const D = db();
  return {
    groups: D.taskFamilies
      .map((f) => ({
        slug: f.slug,
        label: f.label,
        tasks: D.records.tasks.filter((t) => t.family_id === f.slug).map((t) => ({ slug: t.slug, title: t.title, summary: t.problem_statement })),
      }))
      .filter((g) => g.tasks.length),
  };
}
export const meta: Route.MetaFunction = () => pageMeta("How-tos", "Step-by-step guides for practical digital tasks.");

export default function Tasks({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <PageHeader title="How-tos" lead="Step-by-step guides for practical things you want to get done." />
      {d.groups.map((g) => (
        <section key={g.slug} className="section">
          <h2>{g.label}</h2>
          <ul className="card-grid">
            {g.tasks.map((t) => (
              <li key={t.slug} className="card card-link">
                <h3>
                  <Link to={`/tasks/${t.slug}`}>{t.title}</Link>
                </h3>
                <p className="meta">{t.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
