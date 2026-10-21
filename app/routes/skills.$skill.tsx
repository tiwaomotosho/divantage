// S35 Skill page.
import { Link, data, useNavigate } from "react-router";
import { Sprout, TrendingUp, Mountain } from "lucide-react";
import { FlagOff } from "../components/ui";
import type { Route } from "./+types/skills.$skill";
import { skillData } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { Breadcrumb, NeedCard, PageHeader, Section, ToolRow, TrustFooter, WhoUses } from "../components/ui";
import { IdentityPicker } from "../components/IdentityPicker";

export function loader({ params }: Route.LoaderArgs) {
  const d = skillData(params.skill);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.skill.label, d.skill.description) : pageMeta("Not found"));

export default function SkillPage({ loaderData: d }: Route.ComponentProps) {
  if (!flag("explore_skills")) return <FlagOff />;
  const navigate = useNavigate();
  const lv = [
    { k: "beginner" as const, label: "Beginner", I: Sprout },
    { k: "intermediate" as const, label: "Intermediate", I: TrendingUp },
    { k: "expert" as const, label: "Expert", I: Mountain },
  ];
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/skills", label: "Skills" }, ...(d.group ? [{ to: `/skills#${d.group.slug}`, label: d.group.label }] : []), { label: d.skill.label }]} />
      <PageHeader title={d.skill.label} lead={d.skill.description} />
      <ol className="level-cards">
        {lv.map(({ k, label, I }) => (
          <li key={k} className="level-card" data-level={k}>
            <p className="label">
              <I size={18} aria-hidden="true" /> {label}
            </p>
            <p>{d.skill.levels[k]}</p>
          </li>
        ))}
      </ol>
      <div className="tailor-bar">
        <IdentityPicker label="See this for your work: who are you?" max={1} onPick={(p) => navigate(`/for/${p.slug}`)} placeholder="e.g. nurse, farmer, DJ" />
      </div>
      <Section title="Tools to learn it with" id="h-tools">
        <ul className="tool-rows tool-rows-grid">
          {d.tools.map((t) => (
            <ToolRow key={t.slug} t={t} />
          ))}
        </ul>
        {d.toolTotal > d.tools.length && <p className="meta">{d.toolTotal} tools in all; these are the best fit across the skill's needs.</p>}
      </Section>
      <Section title="Course outlines" id="h-outlines">
        <ul className="start-list">
          {d.tools
            .filter((t) => t.roadmap)
            .slice(0, 5)
            .map((t) => (
              <li key={t.slug}>
                <Link className="start-item" to={`/tools/${t.slug}/roadmap`}>
                  {t.name}: skill roadmap
                </Link>
              </li>
            ))}
        </ul>
      </Section>
      <Section title="What it covers" id="h-needs">
        <ul className="card-grid">
          {d.needs.map((n) => (
            <li key={n.slug}>
              <NeedCard n={n} />
            </li>
          ))}
        </ul>
      </Section>
      {d.who.length > 0 && (
        <Section title="Who relies on this skill" id="h-who">
          <WhoUses groups={d.who} />
        </Section>
      )}
      <TrustFooter validation={d.skill.validation} recordId={`skill_${d.skill.slug.replace(/-/g, "_")}`} />
    </div>
  );
}
