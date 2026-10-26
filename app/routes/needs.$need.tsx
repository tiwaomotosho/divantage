// S31 Need page. New composition from goal (07) parts: goal rows and tool rows; needs design review.
import { Link, data } from "react-router";
import type { Route } from "./+types/needs.$need";
import { needData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Crumbs, Icon, NextStepCard, Tag, Tile, ToolLogo, ToolRowCard } from "../components/da";
import { useDevice } from "../lib/store";

export function loader({ params }: Route.LoaderArgs) {
  const d = needData(params.need);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.need.label, d.need.description) : pageMeta("Not found"));

export default function NeedPage({ loaderData: d }: Route.ComponentProps) {
  const dev = useDevice();
  const g0 = d.goals[0];
  return (
    <section className="wrap" style={{ paddingTop: 22 }}>
      <Crumbs items={[{ to: "/goals", label: "Goals" }, { label: d.need.label }]} />
      <div className="row g16" style={{ marginTop: 12 }}>
        <Tile icon={d.need.icon} hue={d.need.hue} size="lg" />
        <div>
          <h1 className="t-h1">{d.need.label}</h1>
          <p className="t-lg mu" style={{ marginTop: 6, maxWidth: 760 }}>
            {d.need.description}
          </p>
        </div>
      </div>
      <div className="rail" style={{ marginTop: 22 }}>
        <div className="col g12">
          <h2 className="t-h3">Tools for this</h2>
          {d.tools.slice(0, 6).map((t, i) => (
            <ToolRowCard key={t.slug} t={t} rank={i + 1} top={i === 0} market={dev?.market} />
          ))}
          <div style={{ marginTop: 12 }}>
            <NextStepCard
              next={
                g0
                  ? { kicker: "Your next step · Pick a goal", title: g0.label, sub: "Tools ranked for this exact job", url: `/goals/${g0.slug}`, cta: "Continue" }
                  : { kicker: "Your next step", title: `Learn ${d.tools[0]?.name ?? "a tool"}`, sub: "Start with the first module", url: d.tools[0]?.learn ?? "/goals", cta: "Start" }
              }
            />
          </div>
        </div>
        <aside className="col g16">
          {d.goals.length > 0 && (
            <div className="card pad">
              <div className="t-label">Goals under this need</div>
              <div className="list" style={{ marginTop: 4 }}>
                {d.goals.map((g) => (
                  <Link key={g.slug} className="li t-sm" to={`/goals/${g.slug}`}>
                    <Icon name="target" />
                    <span className="fl1 b6">{g.label}</span>
                    {g.safety && <Tag hue="amber" icon="shield">Safety</Tag>}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="card pad">
            <div className="t-label">Review</div>
            <div className="row g8 t-sm mu" style={{ marginTop: 8 }}>
              <Tag hue="amber" icon="clock">
                Expert review {d.need.validation === "validated" ? "done" : "pending"}
              </Tag>
            </div>
            <div className="row g6" style={{ marginTop: 10 }}>
              {d.tools.slice(0, 4).map((t) => (
                <ToolLogo key={t.slug} slug={t.slug} size="sm" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
