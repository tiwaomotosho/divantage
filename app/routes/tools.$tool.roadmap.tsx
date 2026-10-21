// S30 / S30-R Roadmap /tools/{tool}/roadmap with depth label and lens switcher.
import { data, useNavigate } from "react-router";
import type { Route } from "./+types/tools.$tool.roadmap";
import { roadmapData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Breadcrumb, ChipList, PageHeader, ToolRow, TrustFooter } from "../components/ui";
import { LevelTabs } from "../components/Roadmap";
import { IdentityPicker } from "../components/IdentityPicker";

export function loader({ params }: Route.LoaderArgs) {
  const d = roadmapData(params.tool);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}

export const meta: Route.MetaFunction = ({ data: d }) =>
  d ? pageMeta(`${d.roadmap.title}: skill roadmap`, `Beginner, intermediate and expert course outline for ${d.tool.name}.`) : pageMeta("Not found");

export function DepthLabel({ depth }: { depth: "in_depth" | "standard" | "reviewed" }) {
  if (depth === "reviewed") return <span className="badge badge-starts">Expert-reviewed</span>;
  if (depth === "in_depth") return <span className="badge badge-neutral">Course outline (in depth)</span>;
  return (
    <details className="depth-disclosure">
      <summary className="badge badge-neutral">Course outline (standard)</summary>
      <p className="meta">Built from a proven template for this type of tool plus its own key skills. An in-depth version is on our list.</p>
    </details>
  );
}

export default function RoadmapPage({ loaderData: d }: Route.ComponentProps) {
  const navigate = useNavigate();
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/tools", label: "Tools" }, { to: `/tools/${d.tool.slug}`, label: d.tool.name }, { label: "Skill roadmap" }]} />
      <PageHeader title={`${d.roadmap.title}: skill roadmap`}>
        <DepthLabel depth={d.roadmap.depth} />
        {d.appliesTo.length > 1 && (
          <>
            <p className="label">Applies to</p>
            <ul className="tool-rows tool-rows-inline">
              {d.appliesTo.map((t) => (
                <ToolRow key={t.slug} t={t} />
              ))}
            </ul>
          </>
        )}
      </PageHeader>
      <div className="tailor-bar">
        <IdentityPicker label="See it for your work: who are you?" max={1} onPick={(p) => navigate(`/for/${p.slug}/${d.tool.slug}`)} placeholder="e.g. accountant, pastor, nurse" />
      </div>
      <LevelTabs levels={d.levels} roadmap={d.roadmap.slug} />
      {d.skills.length > 0 && (
        <section className="section">
          <h2>Part of these skills</h2>
          <ChipList items={d.skills.map((s) => ({ to: `/skills/${s.slug}`, label: s.label }))} />
        </section>
      )}
      <TrustFooter validation={d.roadmap.validation?.status} note={d.roadmap.validation?.note} kind="roadmap" recordId={`rm_${d.roadmap.slug.replace(/-/g, "_")}`} />
    </div>
  );
}
