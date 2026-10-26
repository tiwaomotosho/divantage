// S33 Browse all jobs (reference 05-browse): filter, By sector / A–Z / Life roles, sector cards, Suggest my role (D-103).
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/browse";
import { browseData } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Icon, Tile } from "../components/da";
import { openSuggest } from "../components/SuggestSheet";

export const loader = () => browseData();
export const meta: Route.MetaFunction = ({ data: d }) => pageMeta("Browse all jobs", `${d?.total ?? ""} jobs and roles, every ISCO-08 occupation plus life roles.`);

type View = "sector" | "az" | "life";

export default function Browse({ loaderData: d }: Route.ComponentProps) {
  const [view, setView] = useState<View>("sector");
  const [q, setQ] = useState("");
  const lq = q.trim().toLowerCase();
  const matches = useMemo(() => (lq.length >= 2 ? d.az.filter((i) => i.label.toLowerCase().includes(lq)).slice(0, 60) : []), [lq, d.az]);
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">Browse all jobs</span>
      <h1 className="t-h1" style={{ marginTop: 6 }}>
        {d.total.toLocaleString("en-GB")} jobs and roles
      </h1>
      <p className="mu" style={{ marginTop: 6 }}>
        Every occupation in the ISCO-08 standard, plus specialisms and life roles like parent or retiree.
      </p>
      <label className="input" style={{ marginTop: 20 }}>
        <Icon name="search" />
        <input placeholder="Filter jobs, e.g. midwife" aria-label="Filter jobs" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {lq.length >= 2 ? (
        <div className="card" style={{ marginTop: 16, padding: "4px 20px" }}>
          <div className="list">
            {matches.map((i) => (
              <Link key={i.slug} className="li t-sm" to={`/for/${i.slug}`}>
                <Icon name="user" />
                <span className="fl1 b6">{i.label}</span>
                <Icon name="chevron-right" className="cr" />
              </Link>
            ))}
            {matches.length === 0 && <div className="li t-sm mu">No job matches "{q}".</div>}
          </div>
        </div>
      ) : (
        <>
          <div className="row g8 wrapf" style={{ marginTop: 12 }}>
            <div className="seg" role="tablist" aria-label="Browse by">
              {(
                [
                  ["sector", "By sector"],
                  ["az", "A–Z"],
                  ["life", "Life roles"],
                ] as [View, string][]
              ).map(([v, l]) => (
                <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {view === "sector" && (
            <div className="grid c4" style={{ marginTop: 18 }}>
              {d.sectors.map((s) => (
                <Link key={s.slug} className="card pad row g12" to={`/sectors/${s.slug}`} data-da="sector-card" style={{ padding: 16 }}>
                  <Tile icon={s.icon} hue={s.hue} />
                  <div className="fl1">
                    <div className="b7 t-sm">{s.label}</div>
                    <div className="t-xs su">{s.count} roles</div>
                  </div>
                  <Icon name="chevron-right" />
                </Link>
              ))}
            </div>
          )}
          {view !== "sector" && (
            <div className="card" style={{ marginTop: 18, padding: "4px 20px" }}>
              <div className="list">
                {(view === "az" ? d.az : d.life).map((i) => (
                  <Link key={i.slug} className="li t-sm" to={`/for/${i.slug}`}>
                    <span className="fl1">{i.label}</span>
                    <Icon name="chevron-right" className="cr" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <div className="card pad row g16 wrapf" style={{ marginTop: 20 }}>
        <Tile icon="plus" hue="violet" />
        <div className="fl1">
          <div className="b7">Can't find your job?</div>
          <div className="t-sm mu">Tell us. We add new roles every week.</div>
        </div>
        <a
          className="btn s"
          href="/suggest?type=suggest_identity"
          onClick={(e) => {
            e.preventDefault();
            openSuggest({ reason: "role", on: "Browse all jobs" });
          }}
        >
          Suggest my role
        </a>
      </div>
    </section>
  );
}
