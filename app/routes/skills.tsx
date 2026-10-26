// S34 Skills. Composed from 06-goals: search, group cards (like the intent cards) and grouped lists.
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/skills";
import { skillsIndexData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Icon, Tile } from "../components/da";

export const loader = () => skillsIndexData();
export const meta: Route.MetaFunction = () => pageMeta("Digital skills to learn, from beginner to expert", "Digital skills in groups, each with tools and learning paths.");

export default function Skills({ loaderData: d }: Route.ComponentProps) {
  const [params, setParams] = useSearchParams();
  const group = params.get("group");
  const [q, setQ] = useState("");
  const lq = q.trim().toLowerCase();
  const total = d.groups.reduce((a, g) => a + g.skills.length, 0);
  const groups = useMemo(
    () =>
      d.groups
        .filter((g) => !group || g.slug === group)
        .map((g) => ({ ...g, skills: lq ? g.skills.filter((s) => `${s.label} ${s.description}`.toLowerCase().includes(lq)) : g.skills }))
        .filter((g) => g.skills.length),
    [lq, d.groups, group],
  );
  const pick = (g: string | null) => {
    const p = new URLSearchParams(params);
    if (g) p.set("group", g);
    else p.delete("group");
    setParams(p, { replace: true, preventScrollReset: true });
  };
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">Skills</span>
      <h1 className="t-h1" style={{ marginTop: 6 }}>
        {total} skills you can get good at
      </h1>
      <label className="input" style={{ marginTop: 18 }}>
        <Icon name="search" />
        <input placeholder="Filter skills, e.g. video, data, writing" aria-label="Filter skills" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="grid c3" style={{ marginTop: 18 }}>
        {d.groups.map((g) => {
          const on = group === g.slug;
          return (
            <button key={g.slug} type="button" className="card pad row g12" style={{ textAlign: "left", border: on ? "2px solid var(--da-color-ink)" : undefined }} aria-pressed={on} onClick={() => pick(on ? null : g.slug)}>
              <Tile icon={g.icon} hue={g.hue} />
              <span className="fl1 b7 t-sm">{g.label}</span>
              <span className="t-mono t-xs su">{g.skills.length}</span>
            </button>
          );
        })}
      </div>
      <div className="grid c3" style={{ marginTop: 16 }}>
        {groups.map((g) => (
          <div key={g.slug} id={g.slug} className="card pad">
            <div className="row sb">
              <div className="b7">{g.label}</div>
              <span className="t-mono t-xs su">{g.skills.length}</span>
            </div>
            <div className="list" style={{ marginTop: 6 }}>
              {g.skills.map((s) => (
                <Link key={s.slug} className="li t-sm" to={`/skills/${s.slug}`}>
                  <Icon name={g.icon} />
                  <span className="fl1">
                    <span className="b6">{s.label}</span>
                    <span className="t-xs su" style={{ display: "block" }}>
                      {s.tools} tools · {s.professions.toLocaleString("en-GB")} jobs
                    </span>
                  </span>
                  <Icon name="chevron-right" className="cr" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
