// S12 Playbooks.
import type { Route } from "./+types/playbooks";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { RecordList } from "../components/Record";

export const loader = () => ({ items: db().records.playbooks.map((p) => ({ slug: p.slug, title: p.title, summary: p.outcome })) });
export const meta: Route.MetaFunction = () => pageMeta("Playbooks", "Longer workflows that combine several tools.");

export default function Playbooks({ loaderData: d }: Route.ComponentProps) {
  return <RecordList label="Playbooks" title="Longer workflows" lead="Several tools, from start to a finished result." items={d.items} base="/playbooks/" icon="layers" hue="teal" />;
}
