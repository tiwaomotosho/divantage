// S31 Need page.
import { Link, data } from "react-router";
import type { Route } from "./+types/needs.$need";
import { needData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { ChipList, PageHeader, Section, ToolRow, TrustFooter, WhoUses } from "../components/ui";

export function loader({ params }: Route.LoaderArgs) {
  const d = needData(params.need);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.need.label, d.need.description) : pageMeta("Not found"));

export default function NeedPage({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <PageHeader eyebrow={d.need.universal ? "Everyone benefits" : "What people need to do"} title={d.need.label} lead={d.need.description} />
      <Section title="Tools for this" id="h-tools" lead="In order of fit for most people.">
        <ul className="tool-rows">
          {d.tools.map((t) => (
            <ToolRow key={t.slug} t={t} />
          ))}
        </ul>
      </Section>
      {d.lenses.length > 0 && (
        <Section title="Course outlines for this" id="h-lenses">
          <ul className="start-list">
            {d.lenses.map((l: any) => (
              <li key={l.url}>
                <Link className="start-item" to={l.url}>
                  <span>
                    {l.title}
                    {l.flagship && <span className="badge badge-accent badge-xs">Written for this work</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {d.who.length > 0 && (
        <Section title="Who needs this" id="h-who">
          <WhoUses groups={d.who} />
        </Section>
      )}
      {d.skills.length > 0 && (
        <Section title="Part of these skills" id="h-skills">
          <ChipList items={d.skills.map((s) => ({ to: `/skills/${s.slug}`, label: s.label }))} />
        </Section>
      )}
      {d.related.length > 0 && (
        <Section title="Related needs" id="h-related">
          <ChipList items={d.related.map((s) => ({ to: `/needs/${s.slug}`, label: s.label }))} />
        </Section>
      )}
      <TrustFooter validation={d.need.validation} kind="default" recordId={`need_${d.need.slug.replace(/-/g, "_")}`} />
    </div>
  );
}
