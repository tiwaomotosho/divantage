// S06 How-to guide.
import { data } from "react-router";
import type { Route } from "./+types/tasks.$slug";
import { mention, recordBySlug } from "~/lib/content.server";
import type { ToolMention } from "~/lib/view";
import { meta as pageMeta } from "../lib/build";
import { Bullets, RecordPage, Steps } from "../components/Record";
import { Icon, ToolRowCard } from "../components/da";

export function loader({ params }: Route.LoaderArgs) {
  const r = recordBySlug("tasks", params.slug);
  if (!r) throw data("Not found", { status: 404 });
  return { r, tools: (r.recommended_tool_ids ?? []).map((id: string) => mention(id, { desc: true })).filter(Boolean) as ToolMention[] };
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.r.title, d.r.problem_statement) : pageMeta("Not found"));

export default function Task({ loaderData: { r, tools } }: Route.ComponentProps) {
  return (
    <RecordPage crumbs={[{ to: "/tasks", label: "How-tos" }, { label: r.short_title ?? r.title }]} label="How-to" title={r.title} lead={r.problem_statement} tags={[{ hue: "slate", icon: "clock", text: r.estimated_time?.label ?? "" }, { hue: "green", text: r.difficulty[0].toUpperCase() + r.difficulty.slice(1) }]} sources={r.sources} recordId={r.id} next={tools[0] ? { kicker: "Your next step", title: `Learn ${tools[0].name}`, sub: "Start with the first module", url: tools[0].learn, cta: "Start" } : undefined} aside={<><Bullets title="Before you start" items={r.prerequisites} /><Bullets title="Check your result" items={r.quality_checks} /><Bullets title="Common mistakes" items={r.common_mistakes} icon="flag" /></>}>
      <div className="banner info">
        <Icon name="target" />
        <div className="fl1 t-sm">
          <b>You'll end up with:</b> <span className="mu">{r.expected_outcome}</span>
        </div>
      </div>
      <h2 className="t-h3">Tools that can do this</h2>
      {tools.map((t, i) => (
        <ToolRowCard key={t.slug} t={t} rank={i + 1} top={i === 0} />
      ))}
      <h2 className="t-h3">Steps</h2>
      <Steps id={r.slug} steps={r.steps.map((s: any) => ({ n: s.n, title: s.title, body: s.instructions, extra: s.warning ? `Watch out: ${s.warning}` : s.expected_result ? `You should see: ${s.expected_result}` : undefined }))} />

    </RecordPage>
  );
}
