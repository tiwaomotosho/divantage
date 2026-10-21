// S14 Comparison: table with sticky first column (≥ 768 px), stacked cards on phones.
import { Link, data } from "react-router";
import type { Route } from "./+types/compare.$slug";
import { recordBySlug, toolName } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Breadcrumb, PageHeader, Section, TrustFooter } from "../components/ui";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("comparisons", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  return { r, names: Object.fromEntries(r.tool_ids.map((id: string) => [id, toolName(id)])) };
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.decision_question) : pageMeta("Not found"));

const label = (dim: string) => dim.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function Compare({ loaderData: { r, names } }: Route.ComponentProps) {
  const Cell = ({ c }: { c: any }) =>
    !c || c.kind === "unknown" ? (
      <span className="unknown">Not yet verified</span>
    ) : (
      <>
        {c.text}
        {c.kind === "editorial" && <span className="badge badge-neutral badge-xs">Our view</span>}
      </>
    );
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/discover", label: "Compare" }, { label: r.title }]} />
      <PageHeader eyebrow="Comparison" title={r.title} lead={r.decision_question} />
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">What matters</th>
              {r.tool_ids.map((id: string) => (
                <th scope="col" key={id}>
                  <Link to={`/tools/${names[id]?.slug}`}>{names[id]?.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row: any) => (
              <tr key={row.dimension}>
                <th scope="row">{label(row.dimension)}</th>
                {r.tool_ids.map((id: string) => (
                  <td key={id}>
                    <Cell c={row.cells[id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="compare-cards">
        {r.tool_ids.map((id: string) => (
          <section key={id} className="card">
            <h2 className="h3">{names[id]?.name}</h2>
            <dl>
              {r.rows.map((row: any) => (
                <div key={row.dimension}>
                  <dt>{label(row.dimension)}</dt>
                  <dd>
                    <Cell c={row.cells[id]} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <Section title="Best fit" id="h-fit">
        <ul className="reading bullets">
          {r.best_fit.map((b: any) => (
            <li key={b.tool_id}>
              <strong>{names[b.tool_id]?.name}:</strong> {b.for_whom} <span className="badge badge-neutral badge-xs">Our view</span>
            </li>
          ))}
        </ul>
        <p className="meta reading">{r.method_note}</p>
      </Section>
      <TrustFooter reviewed={r.editorial?.last_verified_at} sources={r.sources} recordId={r.id} validation="pending" />
    </div>
  );
}
