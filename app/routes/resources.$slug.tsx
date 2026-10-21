// S11 Resource detail (links out; no embedded third-party media, D-043).
import { data } from "react-router";
import type { Route } from "./+types/resources.$slug";
import { db, recordBySlug, toolRow } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Breadcrumb, ExternalA, PageHeader, Section, ToolRow, TrustFooter } from "../components/ui";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("resources", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  const v = db().vocab;
  const lab = (k: string, id: string) => v[k].values.find((x: any) => x.id === id)?.label ?? id;
  return {
    r,
    cost: lab("resource_cost_status", r.cost_status),
    type: lab("resource_type", r.resource_type),
    reg: lab("registration_required", r.registration_required),
    tools: (r.related_tool_ids ?? []).map(toolRow).filter(Boolean),
  };
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.summary) : pageMeta("Not found"));

export default function Resource({ loaderData: { r, cost, type, reg, tools } }: Route.ComponentProps) {
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/resources", label: "Learning resources" }, { label: r.title }]} />
      <PageHeader eyebrow={type} title={r.title} lead={r.summary}>
        <p className="meta">
          {r.publisher} · {cost} · {reg}
        </p>
        <ExternalA href={r.canonical_url}>Open the resource</ExternalA>
      </PageHeader>
      <Section title="You'll be able to" id="h-out">
        <p className="reading">{r.learning_outcome}</p>
      </Section>
      {r.limitations?.length > 0 && (
        <Section title="Limitations" id="h-lim">
          <ul className="reading bullets">
            {r.limitations.map((x: any) => (
              <li key={typeof x === "string" ? x : x.text}>{typeof x === "string" ? x : x.text}</li>
            ))}
          </ul>
        </Section>
      )}
      {tools.length > 0 && (
        <Section title="Related tools" id="h-tools">
          <ul className="tool-rows">
            {tools.map((t: any) => (
              <ToolRow key={t.slug} t={t} />
            ))}
          </ul>
        </Section>
      )}
      <TrustFooter reviewed={r.editorial?.last_verified_at} sources={r.sources} recordId={r.id} validation="pending" />
    </div>
  );
}
