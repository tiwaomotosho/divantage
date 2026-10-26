// S14 Comparison: one card per tool on phones, a table from 768 px (new composition from da.css cards and lists).
import { Link, data } from "react-router";
import type { Route } from "./+types/compare.$slug";
import { recordBySlug, toolName } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { RecordPage } from "../components/Record";
import { ToolLogo } from "../components/da";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("comparisons", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  return { r, names: Object.fromEntries(r.tool_ids.map((id: string) => [id, toolName(id)])) as Record<string, { slug: string; name: string } | null> };
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.decision_question) : pageMeta("Not found"));

const label = (dim: string) => dim.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function Compare({ loaderData: { r, names } }: Route.ComponentProps) {
  return (
    <RecordPage crumbs={[{ to: "/tools", label: "Tools" }, { label: "Compare" }]} label="Comparison" title={r.title} lead={r.decision_question} sources={r.sources} recordId={r.id}>
      <div className="grid c3">
        {r.tool_ids.map((id: string) => (
          <div key={id} className="card pad">
            <Link className="row g10" to={`/tools/${names[id]?.slug}`}>
              <ToolLogo slug={names[id]?.slug ?? ""} size="sm" />
              <span className="b7">{names[id]?.name}</span>
            </Link>
            <div className="list" style={{ marginTop: 8 }}>
              {r.rows.map((row: any) => {
                const c = row.cells[id];
                return (
                  <div key={row.dimension} className="li as" style={{ display: "block" }}>
                    <div className="t-label">{label(row.dimension)}</div>
                    <div className="t-sm" style={{ marginTop: 4 }}>
                      {!c || c.kind === "unknown" ? <span className="su">Not yet verified</span> : c.text}
                      {c?.kind === "editorial" && <span className="tag h-slate" style={{ marginLeft: 6 }}>Our view</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="card pad">
        <div className="t-label">Best fit · our view</div>
        <div className="col g8 t-sm" style={{ marginTop: 8 }}>
          {r.best_fit.map((b: any) => (
            <div key={b.tool_id}>
              <b>{names[b.tool_id]?.name}:</b> {b.for_whom}
            </div>
          ))}
        </div>
        <p className="t-xs su" style={{ marginTop: 10 }}>
          {r.method_note}
        </p>
      </div>
    </RecordPage>
  );
}
