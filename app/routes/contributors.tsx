// S38 Contributors (flag contributors_page). Consented credit names only.
import { data } from "react-router";
import type { Route } from "./+types/contributors";
import { db } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { FlagOff, PageHeader } from "../components/ui";

export function loader() {
  const list = (db().contributors.values ?? []) as { name: string; count: number }[];
  return { list: [...list].sort((a, b) => a.name.localeCompare(b.name)) };
}
export const meta: Route.MetaFunction = () => pageMeta("Contributors");

export default function Contributors({ loaderData: d }: Route.ComponentProps) {
  if (!flag("contributors_page")) return <FlagOff />;
  return (
    <div className="container narrow">
      <PageHeader title="Contributors" lead="People who helped improve this site and asked to be thanked by name." />
      {d.list.length === 0 ? (
        <p>No credited contributions yet.</p>
      ) : (
        <ul className="reading bullets">
          {d.list.map((c) => (
            <li key={c.name}>
              {c.name} <span className="meta">· {c.count} {c.count === 1 ? "improvement" : "improvements"}</span>
            </li>
          ))}
        </ul>
      )}
      <p>
        Want to help? Use "Suggest an edit" on any page.
      </p>
    </div>
  );
}
