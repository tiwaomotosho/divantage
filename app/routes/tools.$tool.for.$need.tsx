// S29 Lens page /tools/{tool}/for/{need}.
import { data } from "react-router";
import type { Route } from "./+types/tools.$tool.for.$need";
import { lensData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Breadcrumb, PageHeader, TrustFooter } from "../components/ui";
import { LensView } from "../components/LensView";

export function loader({ params }: Route.LoaderArgs) {
  const d = lensData(params.tool, params.need);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}

export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.title, d.why ?? d.need.description) : pageMeta("Not found"));

export default function LensPage({ loaderData: d }: Route.ComponentProps) {
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/tools", label: "Tools" }, { to: `/tools/${d.tool.slug}`, label: d.tool.name }, { label: `For ${d.need.label.toLowerCase()}` }]} />
      <PageHeader eyebrow={d.flagship ? "Written for this work" : "Tailored course outline"} title={d.title} />
      <LensView d={d} />
      <TrustFooter validation={d.validation?.status} kind="roadmap" recordId={`rm_${d.roadmap.slug.replace(/-/g, "_")}`} note={d.validation?.note} />
    </div>
  );
}
