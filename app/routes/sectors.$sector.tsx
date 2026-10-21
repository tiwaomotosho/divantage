// S32 Sector page.
import { Link, data } from "react-router";
import type { Route } from "./+types/sectors.$sector";
import { sectorData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { NeedCard, PageHeader, Section, ToolRow } from "../components/ui";

export function loader({ params }: Route.LoaderArgs) {
  const d = sectorData(params.sector);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.sector.label, `Digital tools and skills across ${d.sector.label}.`) : pageMeta("Not found"));

export default function SectorPage({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <PageHeader eyebrow="Sector" title={d.sector.label} />
      {d.needs.length > 0 && (
        <Section title="What everyone in this sector needs" id="h-needs">
          <ul className="card-grid">
            {d.needs.map((n) => (
              <li key={n.slug}>
                <NeedCard n={n} />
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Section title="Top tools across the sector" id="h-tools">
        <ul className="tool-rows tool-rows-grid">
          {d.tools.map((t) => (
            <ToolRow key={t.slug} t={t} />
          ))}
        </ul>
      </Section>
      <Section title="Work in this sector" id="h-families">
        <div className="browse-families">
          {d.families.map((f) => (
            <div key={f.slug} className="browse-family">
              <h3 className="h4">{f.label}</h3>
              <ul>
                {f.identities.map((i) => (
                  <li key={i.slug}>
                    <Link to={`/for/${i.slug}`}>{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
