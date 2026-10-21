// S28 Identity × tool /for/{identity}/{tool}: picks the best lens for this identity (18 §7), rendered in the browser.
import { useState } from "react";
import { Link, data, useNavigate } from "react-router";
import type { Route } from "./+types/for.$identity.$tool";
import { lensKey } from "~/lib/identity";
import { lensLevels, roadmapLevels } from "~/lib/lensview";
import type { Lens, Roadmap } from "~/lib/types";
import { meta as pageMeta } from "../lib/build";
import { fetchJson } from "../lib/indexes";
import { Breadcrumb, Callout, NeedCard, PageHeader, TrustFooter, type NeedCardProps, type ToolRowData } from "../components/ui";
import { LensView, type LensBody } from "../components/LensView";
import { LevelTabs } from "../components/Roadmap";

interface IdFile {
  identity: { slug: string; label: string; plural: string; pluralTitle: string };
  resolved: { core: string[]; sector: string[]; universal: string[] };
}
interface ToolFile {
  tool: { slug: string; name: string; row: ToolRowData };
  roadmap: Roadmap | null;
  lenses: Lens[];
  lensNeeds: string[];
  needs: { slug: string; label: string; description: string }[];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  let id: IdFile, tool: ToolFile;
  try {
    [id, tool] = await Promise.all([fetchJson<IdFile>(`/data/id/${params.identity}.json`), fetchJson<ToolFile>(`/data/tool/${params.tool}.json`)]);
  } catch {
    throw data("Not found", { status: 404 });
  }
  const order = [...id.resolved.core, ...id.resolved.sector, ...id.resolved.universal];
  const toolNeeds = new Map(tool.needs.map((n) => [n.slug, n]));
  const cands = order.filter((n) => toolNeeds.has(n));
  const rm = tool.roadmap;
  const lensMap = new Map(tool.lenses.map((l) => [lensKey(l.roadmap, l.need), l]));
  if (!rm || cands.length === 0) {
    const cards = await fetchJson<Record<string, NeedCardProps>>("/data/need-cards.json");
    return { id, tool, fit: null, better: id.resolved.core.slice(0, 3).map((n) => cards[n]).filter(Boolean), roadmapLevels: rm ? roadmapLevels(rm) : null };
  }
  const best = cands.find((n) => lensMap.has(lensKey(rm.slug, n))) ?? cands[0];
  return { id, tool, rm, lensMap, cands, best, fit: true as const, better: [], roadmapLevels: null };
}

export function HydrateFallback() {
  return <div className="container skeleton-page" aria-busy="true" aria-label="Loading" />;
}

export const meta: Route.MetaFunction = ({ data: d }) =>
  d ? pageMeta(`How ${d.id.identity.plural} use ${d.tool.tool.name}`, undefined, { noindex: true }) : pageMeta("Not found");

export default function IdentityTool({ loaderData: d }: Route.ComponentProps) {
  const [need, setNeed] = useState<string>(d.fit ? d.best! : "");
  const navigate = useNavigate();
  const title = `How ${d.id.identity.plural} use ${d.tool.tool.name}`;
  const crumbs = [{ to: `/for/${d.id.identity.slug}`, label: d.id.identity.label }, { label: d.tool.tool.name }];

  if (!d.fit) {
    return (
      <div className="container">
        <Breadcrumb items={crumbs} />
        <PageHeader title={title} />
        <Callout tone="info">
          <p>
            {d.tool.tool.name} isn't commonly part of a {d.id.identity.label.toLowerCase()}'s toolkit, but here's the full outline.
          </p>
        </Callout>
        {d.roadmapLevels && <LevelTabs levels={d.roadmapLevels} roadmap={d.tool.roadmap!.slug} />}
        {d.better.length > 0 && (
          <section className="section">
            <h2>Tools that are part of a {d.id.identity.label.toLowerCase()}'s work</h2>
            <ul className="card-grid">
              {d.better.map((n) => (
                <li key={n.slug}>
                  <NeedCard n={n} identity={{ slug: d.id.identity.slug, plural: d.id.identity.plural }} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <p>
          <Link to={`/for/${d.id.identity.slug}`}>Back to the toolkit for {d.id.identity.plural}</Link>
        </p>
      </div>
    );
  }

  const rm = d.rm!;
  const fl = d.lensMap!.get(lensKey(rm.slug, need));
  const n = d.tool.needs.find((x) => x.slug === need)!;
  const { comp, levels } = lensLevels(rm, fl, need, n.label);
  const body: LensBody = {
    tool: { slug: d.tool.tool.slug, name: d.tool.tool.name },
    roadmap: { slug: rm.slug },
    need: n,
    flagship: comp.flagship,
    why: fl?.why ?? null,
    different: fl?.what_is_different ?? null,
    starter: fl?.starter_project ?? null,
    pitfalls: fl?.pitfalls ?? [],
    pairs: [],
    forIdentities: [],
    withNeed: [],
    levels,
  };
  const others = d.cands!.filter((c) => c !== need);
  return (
    <div className="container">
      <Breadcrumb items={crumbs} />
      <PageHeader eyebrow={comp.title} title={title}>
        {d.tool.lensNeeds.includes(need) && (
          <p>
            <Link to={`/tools/${d.tool.tool.slug}/for/${need}`}>Shareable version of this page</Link>
          </p>
        )}
      </PageHeader>
      {others.length > 0 && (
        <div className="field need-select">
          <label htmlFor="other-need" className="label">
            Not your situation? Choose a different need
          </label>
          <select id="other-need" value={need} onChange={(e) => setNeed(e.target.value)}>
            {d.cands!.map((c) => (
              <option key={c} value={c}>
                {d.tool.needs.find((x) => x.slug === c)!.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <LensView d={body} />
      <p>
        <button type="button" className="btn btn-tertiary" onClick={() => navigate(`/for/${d.id.identity.slug}`)}>
          Back to the toolkit for {d.id.identity.plural}
        </button>
      </p>
      <TrustFooter validation={fl?.expert_validation?.status ?? "pending"} kind="roadmap" />
    </div>
  );
}
