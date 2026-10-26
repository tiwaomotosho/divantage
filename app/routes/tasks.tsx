// S05 How-tos.
import type { Route } from "./+types/tasks";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { RecordList } from "../components/Record";

export const loader = () => ({ items: db().records.tasks.map((t) => ({ slug: t.slug, title: t.title, summary: t.problem_statement })) });
export const meta: Route.MetaFunction = () => pageMeta("How-tos", "Step-by-step guides for practical digital tasks.");

export default function Tasks({ loaderData: d }: Route.ComponentProps) {
  return <RecordList label="How-tos" title="Step-by-step guides" lead="Practical things you want to get done, one step at a time." items={d.items} base="/tasks/" icon="file-text" hue="violet" />;
}
