// S49 Kits (reference 09-kits): two photo feature kits, then icon kits.
import { Link } from "react-router";
import type { Route } from "./+types/kits";
import { kitsData } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { FlagOff, Picture, Tag, Tile, ToolLogo } from "../components/da";

export const loader = () => kitsData();
export const meta: Route.MetaFunction = () => pageMeta("Kits: start from your situation", "Ready-made paths that put the goals, tools and safety checks you need in order.");

export default function Kits({ loaderData: d }: Route.ComponentProps) {
  if (!flag("kits")) return <FlagOff />;
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">Kits · Common situations</span>
      <h1 className="t-h1" style={{ marginTop: 6 }}>
        Start from your situation
      </h1>
      <p className="t-lg mu" style={{ marginTop: 6 }}>
        {d.total} ready-made paths. Each kit puts the goals, tools and safety checks you need in order.
      </p>
      <div className="grid c2" style={{ marginTop: 20 }}>
        {d.featured.map((k) => (
          <Link key={k.slug} className="card el" to={`/kits/${k.slug}`} style={{ overflow: "hidden", display: "grid", gridTemplateColumns: "1fr" }} data-da="kit-feature">
            <div style={{ aspectRatio: "16/9" }}>
              <Picture slug={k.photo} ratio="wide" className="" sizes="(min-width:768px) 50vw, 100vw" />
            </div>
            <div className="pad" style={{ padding: 22 }}>
              <Tag hue={k.hue} icon={k.icon}>
                {k.label}
              </Tag>
              <h2 className="t-h2" style={{ marginTop: 10 }}>
                {k.title}
              </h2>
              <p className="t-sm mu" style={{ marginTop: 6 }}>
                {k.promise}
              </p>
              <div className="row g6" style={{ marginTop: 12 }}>
                {k.logos.map((l) => (
                  <ToolLogo key={l} slug={l} size="sm" />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid c6" style={{ marginTop: 16 }}>
        {d.kits.map((k) => (
          <Link key={k.slug} className="card pad col g12" to={`/kits/${k.slug}`} data-da="kit-card">
            <Tile icon={k.icon} hue={k.hue} />
            <span className="b7 t-sm" style={{ lineHeight: 1.3 }}>
              {k.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
