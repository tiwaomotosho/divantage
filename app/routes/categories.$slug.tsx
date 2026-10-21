// S04 Category landing (hidden categories show "coming soon", noindex; D-035).
import { Link, data } from "react-router";
import type { Route } from "./+types/categories.$slug";
import { categoriesData, db, toolRow, type ToolRow as ToolRowT } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Breadcrumb, Callout, PageHeader, ToolRow } from "../components/ui";

export function loader({ params }: Route.LoaderArgs) {
  const c = categoriesData().find((x) => x.slug === params.slug);
  if (!c) throw data("Not found", { status: 404 });
  const D = db();
  const has = (r: any) => (r.category_ids ?? []).includes(c.id) || (r.category_ids ?? []).includes(c.slug);
  const tools = D.records.tools
    .filter(has)
    .map((t) => toolRow(t.id))
    .filter((t): t is ToolRowT => Boolean(t))
    .sort((a, b) => Number(b.starts) - Number(a.starts) || a.name.localeCompare(b.name));
  return {
    c,
    tools,
    tasks: D.records.tasks.filter(has).map((t) => ({ slug: t.slug, title: t.short_title ?? t.title })),
    playbooks: D.records.playbooks.filter(has).map((t) => ({ slug: t.slug, title: t.title })),
    comparisons: D.records.comparisons.filter(has).map((t) => ({ slug: t.slug, title: t.title })),
  };
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.c.label, d.c.description, { noindex: !d.c.visible }) : pageMeta("Not found"));

function Links({ title, base, items }: { title: string; base: string; items: { slug: string; title: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="section">
      <h2>{title}</h2>
      <ul className="start-list">
        {items.map((t) => (
          <li key={t.slug}>
            <Link className="start-item" to={`${base}${t.slug}`}>
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Category({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/discover", label: "Discover" }, { label: d.c.label }]} />
      <PageHeader title={d.c.label} lead={d.c.description} />
      {!d.c.visible && <Callout tone="info">This category is coming soon. We list it once it has at least three checked tools or guides.</Callout>}
      <Links title="How-tos" base="/tasks/" items={d.tasks} />
      {d.tools.length > 0 && (
        <section className="section">
          <h2>Tools</h2>
          <p className="meta">Sorted: options you can start without paying first, then A–Z.</p>
          <ul className="tool-rows">
            {d.tools.map((t) => (
              <ToolRow key={t.slug} t={t} />
            ))}
          </ul>
        </section>
      )}
      <Links title="Playbooks" base="/playbooks/" items={d.playbooks} />
      <Links title="Comparisons" base="/compare/" items={d.comparisons} />
    </div>
  );
}
