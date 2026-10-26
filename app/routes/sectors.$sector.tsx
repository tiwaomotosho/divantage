// S32 Sector page. Composed from 04-identity (hue wash header, tabs, need cards) and 05-browse (role lists).
import { useState } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/sectors.$sector";
import { sectorData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Crumbs, DepthLabel, Icon, NextStepCard, Tag, Tile, ToolLogo } from "../components/da";

export function loader({ params }: Route.LoaderArgs) {
  const d = sectorData(params.sector);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.sector.label, `Jobs and tools in ${d.sector.label}.`) : pageMeta("Not found"));

export default function SectorPage({ loaderData: d }: Route.ComponentProps) {
  const [tab, setTab] = useState<"needs" | "jobs">("needs");
  const roles = d.families.reduce((a, f) => a + f.identities.length, 0);
  const first = d.families[0]?.identities[0];
  return (
    <>
      <section style={{ background: `linear-gradient(180deg,var(--da-hue-${d.sector.hue}-bg),var(--da-color-canvas))` }}>
        <div className="wrap" style={{ paddingTop: 24, paddingBottom: 26 }}>
          <Crumbs items={[{ to: "/for", label: "Explore" }, { label: d.sector.label }]} />
          <div className="row g16" style={{ marginTop: 14 }}>
            <Tile icon={d.sector.icon} hue={d.sector.hue} size="lg" />
            <div>
              <div className="row g6 wrapf">
                <Tag hue={d.sector.hue}>Sector</Tag>
                <Tag hue="slate">{roles} roles</Tag>
              </div>
              <h1 className="t-h1" style={{ marginTop: 8 }}>
                {d.sector.label}
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section className="wrap">
        <div className="seg" role="tablist" aria-label="Sections" style={{ margin: "4px 0 20px" }}>
          <button type="button" role="tab" aria-selected={tab === "needs"} onClick={() => setTab("needs")}>
            Shared needs
          </button>
          <button type="button" role="tab" aria-selected={tab === "jobs"} onClick={() => setTab("jobs")}>
            Jobs
          </button>
        </div>
        {tab === "needs" && (
          <div className="grid c3">
            {d.needs.map((n) => (
              <Link key={n.slug} className="card pad el col" to={`/needs/${n.slug}`} data-da="need-card">
                <div className="row sb">
                  <Tile icon={n.tile.icon} hue={n.tile.hue} />
                  <DepthLabel depth={n.depth} />
                </div>
                <div className="b7" style={{ marginTop: 14, fontSize: "1.0625rem" }}>
                  {n.label}
                </div>
                <div className="row g6" style={{ marginTop: 12 }}>
                  {n.logos.map((l) => (
                    <ToolLogo key={l} slug={l} size="sm" />
                  ))}
                  {n.more > 0 && <span className="t-xs su" style={{ marginLeft: 4 }}>+{n.more} tools</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
        {tab === "jobs" && (
          <div className="grid c3">
            {d.families.map((f) => (
              <div key={f.slug} className="card pad">
                <div className="row sb">
                  <div className="b7">{f.label}</div>
                  <span className="t-mono t-xs su">{f.identities.length}</span>
                </div>
                <div className="list" style={{ marginTop: 6 }}>
                  {f.identities.slice(0, 8).map((i) => (
                    <Link key={i.slug} className="li t-sm" to={`/for/${i.slug}`}>
                      <Icon name="user" />
                      <span className="fl1">{i.label}</span>
                      <Icon name="chevron-right" className="cr" />
                    </Link>
                  ))}
                </div>
                {f.identities.length > 8 && (
                  <Link className="t-sm pr b6" to={`/for?sector=${d.sector.slug}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                    All {f.identities.length} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
        {first && (
          <div style={{ marginTop: 24 }}>
            <NextStepCard next={{ kicker: "Your next step · Pick your job", title: `Tools for ${first.label}`, sub: "Every job has its own tools and learning paths", url: `/for/${first.slug}`, cta: "Open" }} />
          </div>
        )}
      </section>
    </>
  );
}
