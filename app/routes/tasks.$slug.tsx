// S06 Task guide.
import { Link, data } from "react-router";
import type { Route } from "./+types/tasks.$slug";
import { recordBySlug, toolRow } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Breadcrumb, Callout, PageHeader, Section, ToolRow, TrustFooter } from "../components/ui";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("tasks", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  const ids = new Set<string>([...(r.recommended_tool_ids ?? []), ...r.steps.flatMap((s: any) => s.tool_ids ?? [])]);
  return { r, tools: Object.fromEntries([...ids].map((id) => [id, toolRow(id)]).filter(([, t]) => t)) };
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.problem_statement) : pageMeta("Not found"));

export default function Task({ loaderData: { r, tools } }: Route.ComponentProps) {
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/tasks", label: "Tasks" }, { label: r.short_title ?? r.title }]} />
      <PageHeader eyebrow="How-to" title={r.title} lead={r.problem_statement}>
        <p className="meta">
          {r.estimated_time?.label} · {r.difficulty}
        </p>
      </PageHeader>
      <Callout tone="info" title="You'll end up with">
        <p>{r.expected_outcome}</p>
      </Callout>
      {r.prerequisites?.length > 0 && (
        <Section title="Before you start" id="h-pre">
          <ul className="reading bullets">
            {r.prerequisites.map((x: string) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
      )}
      <Section title="Tools that can do this" id="h-tools">
        <ul className="tool-rows">
          {r.recommended_tool_ids.map((id: string) => tools[id] && <ToolRow key={id} t={tools[id]!} />)}
        </ul>
        {r.budget_note && <p className="meta reading">{r.budget_note}</p>}
      </Section>
      <Section title="Steps" id="h-steps">
        <ol className="stepper">
          {r.steps.map((s: any) => (
            <li key={s.n} className="stepper-item">
              <span className="stepper-num" aria-hidden="true">
                {s.n}
              </span>
              <div>
                <h3>{s.title}</h3>
                <p className="reading">{s.instructions}</p>
                {s.expected_result && <p className="meta">You should see: {s.expected_result}</p>}
                {s.warning && <Callout tone="warning">{s.warning}</Callout>}
              </div>
            </li>
          ))}
        </ol>
      </Section>
      {r.quality_checks?.length > 0 && (
        <Section title="Check your result" id="h-check">
          <ul className="reading bullets">
            {r.quality_checks.map((x: string) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
      )}
      {r.common_mistakes?.length > 0 && (
        <Section title="Common mistakes" id="h-mistakes">
          <ul className="reading bullets">
            {r.common_mistakes.map((x: string) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
      )}
      {r.privacy_or_safety_notes && <Callout tone="warning">{String(r.privacy_or_safety_notes)}</Callout>}
      <p>
        <Link to="/tasks">All how-tos</Link>
      </p>
      <TrustFooter reviewed={r.editorial?.last_verified_at} sources={r.sources} recordId={r.id} validation="pending" />
    </div>
  );
}
