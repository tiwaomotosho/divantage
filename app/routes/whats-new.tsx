// S37 What's new: weekly notes from content/whats-new.json (appended by the release job).
import { Link, data } from "react-router";
import type { Route } from "./+types/whats-new";
import { db } from "~/lib/content.server";
import { formatDate } from "~/lib/format";
import { flag, meta as pageMeta } from "../lib/build";
import { FlagOff, PageHeader } from "../components/ui";

interface Week {
  week: string;
  items: { title: string; url?: string; credit?: string }[];
}

export function loader() {
  const weeks = (db().whatsNew.weeks ?? []) as Week[];
  return { weeks: [...weeks].sort((a, b) => b.week.localeCompare(a.week)) };
}
export const meta: Route.MetaFunction = () => pageMeta("What's new", "This site improves every week.");

export default function WhatsNew({ loaderData: d }: Route.ComponentProps) {
  if (!flag("whats_new")) return <FlagOff />;
  return (
    <div className="container narrow">
      <PageHeader title="What's new" lead="This site improves every week, often thanks to people like you." />
      {d.weeks.length === 0 && <p>Nothing here yet. The first weekly notes appear after the first release.</p>}
      {d.weeks.map((w) => (
        <section key={w.week} className="section">
          <h2>Week of {formatDate(w.week)}</h2>
          <ul className="reading bullets">
            {w.items.map((i) => (
              <li key={i.title}>
                {i.url ? <Link to={i.url}>{i.title}</Link> : i.title}
                {i.credit && <span className="meta"> · Thanks to {i.credit}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
