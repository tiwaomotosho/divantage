// S38 Contributors: consented credit names. Sample names until real credited suggestions exist.
import { Link } from "react-router";
import type { Route } from "./+types/contributors";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Icon } from "../components/da";

export const loader = () => {
  const c = db().contributors;
  return { demo: Boolean(c.demo), list: ((c.values ?? []) as { name: string; count: number }[]).sort((a, b) => a.name.localeCompare(b.name)) };
};
export const meta: Route.MetaFunction = () => pageMeta("Contributors", "People who helped improve this site.");

export default function Contributors({ loaderData: d }: Route.ComponentProps) {
  return (
    <section className="wrap" style={{ paddingTop: 28, maxWidth: 640 }}>
      <span className="t-label">Contributors</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>Thank you</h1>
      <p className="mu" style={{ marginTop: 6 }}>People who helped improve this site and asked to be thanked by name.</p>
      {d.demo && (
        <div className="banner info" style={{ marginTop: 14 }}>
          <Icon name="info" />
          <div className="fl1 t-sm"><b>Preview with sample names.</b> <span className="mu">Real names appear here when people choose to be credited for an accepted suggestion.</span></div>
        </div>
      )}
      <div className="card" style={{ marginTop: 18, padding: "4px 20px" }}>
        <div className="list">
          {d.list.map((c) => (
            <div key={c.name} className="li t-sm"><span className="av" aria-hidden="true">{c.name[0]}</span><span className="fl1 b6">{c.name}</span><span className="su">{c.count} {c.count === 1 ? "improvement" : "improvements"}</span></div>
          ))}
        </div>
      </div>
      <Link className="btn s" style={{ marginTop: 16 }} to="/suggest"><Icon name="edit" /> Suggest an edit</Link>
    </section>
  );
}
