// S13 Playbook.
import { data } from "react-router";
import type { Route } from "./+types/playbooks.$slug";
import { mention, recordBySlug } from "~/lib/content.server";
import type { ToolMention } from "~/lib/view";
import { meta as pageMeta } from "../lib/build";
import { Bullets, RecordPage, Steps } from "../components/Record";
import { Icon, ToolRowCard } from "../components/da";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("playbooks", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  return { r, tools: (r.tool_ids ?? []).map((id: string) => mention(id, { desc: true })).filter(Boolean) as ToolMention[] };
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.outcome) : pageMeta("Not found"));

export default function Playbook({ loaderData: { r, tools } }: Route.ComponentProps) {
  return (
    <RecordPage crumbs={[{ to: "/playbooks", label: "Playbooks" }, { label: r.title }]} label="Playbook" title={r.title} lead={r.outcome} tags={[{ hue: "slate", icon: "clock", text: r.estimated_duration?.label ?? "" }, { hue: "green", text: r.difficulty[0].toUpperCase() + r.difficulty.slice(1) }]} sources={r.sources} recordId={r.id} next={tools[0] ? { kicker: "Your next step", title: `Learn ${tools[0].name}`, sub: "Start with the first module", url: tools[0].learn, cta: "Start" } : undefined} aside={<><Bullets title="You'll need" items={[...(r.prerequisites ?? []), ...(r.required_inputs ?? [])]} /><Bullets title="You've succeeded when" items={r.success_criteria} /><Bullets title="Common failures" items={r.common_failure_modes} icon="flag" /></>}>
      <h2 className="t-h3">Tools</h2>
      {tools.map((t, i) => (
        <ToolRowCard key={t.slug} t={t} rank={i + 1} top={i === 0} />
      ))}
      <h2 className="t-h3">Steps</h2>
      <Steps id={r.slug} steps={r.steps.map((s: any) => ({ n: s.n, title: s.title, body: s.instructions, extra: s.check ? `Check: ${s.check}` : undefined }))} />
      {r.verification && (
        <div className="banner info">
          <Icon name="check-circle" />
          <div className="fl1 t-sm">
            <b>Verify your work:</b> <span className="mu">{r.verification}</span>
          </div>
        </div>
      )}
    </RecordPage>
  );
}
