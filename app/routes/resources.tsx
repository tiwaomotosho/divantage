// S10 Learning resources.
import type { Route } from "./+types/resources";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { RecordList } from "../components/Record";

export const loader = () => ({ items: db().records.resources.map((r) => ({ slug: r.slug, title: r.title, summary: r.summary })) });
export const meta: Route.MetaFunction = () => pageMeta("Learning resources", "Official documentation and free courses we have checked.");

export default function Resources({ loaderData: d }: Route.ComponentProps) {
  return <RecordList label="Learning resources" title="Official docs and free courses" lead="Checked and linked at the source." items={d.items} base="/resources/" icon="book-open" hue="blue" />;
}
