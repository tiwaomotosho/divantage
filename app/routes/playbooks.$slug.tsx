// S13 Playbook detail (timeline stepper).
import { data } from "react-router";
import type { Route } from "./+types/playbooks.$slug";
import { recordBySlug, toolRow } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Breadcrumb, Callout, PageHeader, Section, ToolRow, TrustFooter } from "../components/ui";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("playbooks", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  return { r, tools: (r.tool_ids ?? []).map(toolRow).filter(Boolean) };
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.outcome) : pageMeta("Not found"));

export default function Playbook({ loaderData: { r, tools } }: Route.ComponentProps) {
  const list = (title: string, xs?: string[]) =>
    xs?.length ? (
      <Section title={title} id={`h-${title.toLowerCase().replace(/\W+/g, "-")}`}>
        <ul className="reading bullets">
          {xs.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>
    ) : null;
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/playbooks", label: "Playbooks" }, { label: r.title }]} />
      <PageHeader eyebrow="Playbook" title={r.title} lead={r.outcome}>
        <p className="meta">
          {r.estimated_duration?.label} · {r.difficulty}
        </p>
      </PageHeader>
      {list("You'll need", [...(r.prerequisites ?? []), ...(r.required_inputs ?? [])])}
      <Section title="Tools" id="h-tools">
        <ul className="tool-rows">
          {tools.map((t: any) => (
            <ToolRow key={t.slug} t={t} />
          ))}
        </ul>
      </Section>
      <Section title="Steps" id="h-steps">
        <ol className="stepper stepper-timeline">
          {r.steps.map((s: any) => (
            <li key={s.n} className="stepper-item">
              <span className="stepper-num" aria-hidden="true">
                {s.n}
              </span>
              <div>
                <h3>{s.title}</h3>
                {s.purpose && <p className="meta">{s.purpose}</p>}
                <p className="reading">{s.instructions}</p>
                {s.expected_output && <p className="meta">Output: {s.expected_output}</p>}
                {s.check && <p className="meta">Check: {s.check}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Section>
      {r.verification && (
        <Callout tone="info" title="Verify your work">
          <p>{r.verification}</p>
        </Callout>
      )}
      {list("You've succeeded when", r.success_criteria)}
      {list("Common failures", r.common_failure_modes)}
      {r.troubleshooting?.length > 0 && (
        <Section title="Troubleshooting" id="h-trouble">
          {r.troubleshooting.map((t: any) => (
            <details key={t.problem} className="accordion">
              <summary>{t.problem}</summary>
              <p>{t.fix}</p>
            </details>
          ))}
        </Section>
      )}
      {r.example && (
        <Section title="Example" id="h-example">
          <p className="reading">
            <strong>Input:</strong> {r.example.input}
          </p>
          <p className="reading">
            <strong>Output:</strong> {r.example.output}
          </p>
        </Section>
      )}
      <TrustFooter reviewed={r.editorial?.last_verified_at} sources={r.sources} recordId={r.id} validation="pending" />
    </div>
  );
}
