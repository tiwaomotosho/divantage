// S34 Skills index.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/skills";
import { skillsIndexData } from "~/lib/content.server";
import { BRAND, flag, meta as pageMeta } from "../lib/build";
import { FlagOff, PageHeader } from "../components/ui";
import { data } from "react-router";

export function loader() {
  return skillsIndexData();
}
export const meta: Route.MetaFunction = () => [
  { title: `Digital skills to learn, from beginner to expert — ${BRAND}` },
  ...pageMeta("", "63 digital skills in 9 groups, each with tools and course outlines.").slice(1),
];

export default function Skills({ loaderData: d }: Route.ComponentProps) {
  if (!flag("explore_skills")) return <FlagOff />;
  const [q, setQ] = useState("");
  const lq = q.trim().toLowerCase();
  const groups = useMemo(
    () => (lq ? d.groups.map((g) => ({ ...g, skills: g.skills.filter((s) => (s.label + " " + s.description).toLowerCase().includes(lq)) })).filter((g) => g.skills.length) : d.groups),
    [lq, d.groups],
  );
  return (
    <div className="container">
      <PageHeader title="What do you want to get good at?" lead="Each skill has a beginner, intermediate and expert level, with the tools to learn it." />
      <div className="field filter-field">
        <label className="label" htmlFor="skill-filter">
          Filter skills
        </label>
        <input id="skill-filter" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. video, data, writing" />
      </div>
      {groups.map((g) => (
        <section key={g.slug} id={g.slug} className="section">
          <h2>{g.label}</h2>
          <ul className="card-grid">
            {g.skills.map((s) => (
              <li key={s.slug} className="card card-link skill-card">
                <h3>
                  <Link to={`/skills/${s.slug}`}>{s.label}</Link>
                </h3>
                <p className="meta">{s.description}</p>
                <p className="meta">
                  {s.tools} tools · used in {s.professions.toLocaleString("en-GB")} professions
                </p>
                <span className="mini-bar" aria-hidden="true">
                  <span data-level="beginner" />
                  <span data-level="intermediate" />
                  <span data-level="expert" />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p>
        Prefer to start with who you are? <Link to="/">Tell us your work</Link>.
      </p>
    </div>
  );
}
