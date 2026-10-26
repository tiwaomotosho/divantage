// S35 Skill page. New composition from identity (04) and goal (07) parts; needs design review.
import { Link, data } from "react-router";
import type { Route } from "./+types/skills.$skill";
import { skillData } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { Crumbs, DepthLabel, FlagOff, NextStepCard, Tag, Tile, ToolLogo, ToolRowCard } from "../components/da";

export function loader({ params }: Route.LoaderArgs) {
  const d = skillData(params.skill);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.skill.label, d.skill.description) : pageMeta("Not found"));

export default function SkillPage({ loaderData: d }: Route.ComponentProps) {
  if (!flag("explore_skills")) return <FlagOff />;
  const lv = [
    ["beginner", "Beginner", "green"],
    ["intermediate", "Intermediate", "blue"],
    ["expert", "Expert", "violet"],
  ] as const;
  const t0 = d.tools[0];
  return (
    <section className="wrap" style={{ paddingTop: 22 }}>
      <Crumbs items={[{ to: "/skills", label: "Skills" }, ...(d.group ? [{ to: `/skills#${d.group.slug}`, label: d.group.label }] : [])]} />
      <div className="row g16" style={{ marginTop: 12 }}>
        {d.group && <Tile icon={d.group.icon} hue={d.group.hue} size="lg" />}
        <div>
          <h1 className="t-h1">{d.skill.label}</h1>
          <p className="t-lg mu" style={{ marginTop: 6 }}>
            {d.skill.description}
          </p>
        </div>
      </div>
      <div className="grid c3" style={{ marginTop: 20 }}>
        {lv.map(([k, l, h]) => (
          <div key={k} className="card pad">
            <Tag hue={h}>{l}</Tag>
            <p className="t-sm" style={{ marginTop: 10 }}>
              {d.skill.levels[k]}
            </p>
          </div>
        ))}
      </div>
      <h2 className="t-h3" style={{ marginTop: 24 }}>
        Tools to learn it with
      </h2>
      <div className="col g12" style={{ marginTop: 12 }}>
        {d.tools.slice(0, 4).map((t, i) => (
          <ToolRowCard key={t.slug} t={t} rank={i + 1} top={i === 0} />
        ))}
      </div>
      <h2 className="t-h3" style={{ marginTop: 24 }}>
        What it covers
      </h2>
      <div className="grid c3" style={{ marginTop: 12 }}>
        {d.needs.slice(0, 6).map((n) => (
          <Link key={n.slug} className="card pad col g10" to={`/needs/${n.slug}`}>
            <div className="row sb">
              <Tile icon={n.tile.icon} hue={n.tile.hue} />
              <DepthLabel depth={n.depth} />
            </div>
            <div className="b7">{n.label}</div>
            <div className="row g6">
              {n.logos.map((l) => (
                <ToolLogo key={l} slug={l} size="sm" />
              ))}
            </div>
          </Link>
        ))}
      </div>
      {t0 && (
        <div style={{ marginTop: 24 }}>
          <NextStepCard next={{ kicker: "Your next step", title: `Learn ${t0.name}`, sub: `${t0.depth?.label ?? "Learning path"} · start with the first module`, url: t0.learn, cta: "Start" }} />
        </div>
      )}
    </section>
  );
}
