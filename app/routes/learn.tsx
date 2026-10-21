// S26 Learn hub: playbooks + resources.
import { Link } from "react-router";
import type { Route } from "./+types/learn";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { PageHeader } from "../components/ui";

export function loader() {
  const D = db();
  return {
    resources: D.records.resources.map((r) => ({ slug: r.slug, title: r.title })),
    playbooks: D.records.playbooks.map((p) => ({ slug: p.slug, title: p.title })),
    roadmaps: D.roadmaps.length,
  };
}
export const meta: Route.MetaFunction = () => pageMeta("Learn", "Course outlines, playbooks and learning resources.");

export default function Learn({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <PageHeader title="Learn" lead={`Every tool has a three-level course outline (${d.roadmaps} in total). Start from who you are, a skill, or a tool.`} />
      <div className="two-col">
        <section className="section">
          <h2>Playbooks</h2>
          <ul className="start-list">
            {d.playbooks.map((p) => (
              <li key={p.slug}>
                <Link className="start-item" to={`/playbooks/${p.slug}`}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="section">
          <h2>Learning resources</h2>
          <ul className="start-list">
            {d.resources.map((p) => (
              <li key={p.slug}>
                <Link className="start-item" to={`/resources/${p.slug}`}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
