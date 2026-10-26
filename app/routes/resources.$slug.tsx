// S11 Learning resource (links out; no embedded third-party media, D-043).
import { data } from "react-router";
import type { Route } from "./+types/resources.$slug";
import { db, recordBySlug, toolLite } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { RecordPage } from "../components/Record";
import { Icon, ToolLogo } from "../components/da";
import { Link } from "react-router";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("resources", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  const v = db().vocab;
  const labelOf = (k: string, id: string) => v[k].values.find((x: any) => x.id === id)?.label ?? id;
  return { r, cost: labelOf("resource_cost_status", r.cost_status), type: labelOf("resource_type", r.resource_type), tools: (r.related_tool_ids ?? []).map(toolLite).filter(Boolean) as { slug: string; name: string; price: string }[] };
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.summary) : pageMeta("Not found"));

export default function Resource({ loaderData: { r, cost, type, tools } }: Route.ComponentProps) {
  return (
    <RecordPage crumbs={[{ to: "/resources", label: "Learning resources" }, { label: r.title }]} label={type} title={r.title} lead={r.summary} tags={[{ hue: "slate", text: r.publisher }, { hue: "green", text: cost }]} sources={r.sources} recordId={r.id}>
      <div className="card pad">
        <div className="t-label">You'll be able to</div>
        <p style={{ marginTop: 6 }}>{r.learning_outcome}</p>
        <a className="btn p" style={{ marginTop: 14 }} href={r.canonical_url} target="_blank" rel="noopener noreferrer">
          Open the resource <Icon name="external" />
        </a>
      </div>
      {tools.length > 0 && (
        <div className="card pad">
          <div className="t-label">Related tools</div>
          <div className="list" style={{ marginTop: 4 }}>
            {tools.map((t) => (
              <Link key={t.slug} className="li" to={`/tools/${t.slug}`}>
                <ToolLogo slug={t.slug} size="sm" />
                <span className="t-sm b6 fl1">{t.name}</span>
                <span className="t-xs su">{t.price}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </RecordPage>
  );
}
