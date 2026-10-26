// A01 Admin report (doc 20 §9). Catalogue numbers are real (computed at build). Visitor signals (zero-result
// queries, identity misses, broken links, suggestions, helper starts) are sample data until event storage exists.
import { Link } from "react-router";
import type { Route } from "./+types/admin.report";
import { db, listedHelpers, trustFor } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { Icon, Prog, Tag, ToolLogo } from "../components/da";

export function loader() {
  const D = db();
  const tiers = D.roadmaps.reduce<Record<string, number>>((a, r) => ((a[r.authoring ?? "handwritten"] = (a[r.authoring ?? "handwritten"] ?? 0) + 1), a), {});
  const preview = D.profiles.filter((p) => p.preview.shown).length;
  const webSeen = D.profiles.filter((p) => p.verification.level === "web_seen").length;
  const alt7 = D.alternatives.filter((a) => a.alternative_ids.length >= 7).length;
  // Most-needed, least-deep: tools many identities reach whose learning path is only a general guide.
  if (!D.whoUses) D.whoUses = D.engine.whoUsesAll();
  const reach = [...D.whoUses.entries()].map(([t, m]) => ({ t, n: [...m.values()].reduce((a, s) => a + s.length, 0) }));
  const leastDeep = reach
    .filter((x) => {
      const rm = D.engine.roadmapForTool(x.t);
      return rm && rm.authoring && rm.authoring !== "handwritten";
    })
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map((x) => ({ slug: D.regById.get(x.t)!.slug, name: D.regById.get(x.t)!.name, reach: x.n, price: trustFor(D.regById.get(x.t)!.slug).price }));
  return {
    kpis: [
      ["Jobs and roles", D.identities.length],
      ["Needs", D.needsFile.values.length],
      ["Goals", D.goals.length],
      ["Kits", D.kits.length],
      ["Tools", D.registry.length],
      ["Learning paths", D.roadmaps.length],
    ] as [string, number][],
    quality: [
      ["Profiles still in Preview", preview, D.profiles.length],
      ["Profiles partly web-checked", webSeen, D.profiles.length],
      ["Handwritten learning paths", tiers.handwritten ?? 0, D.roadmaps.length],
      ["Tools with 7 alternatives", alt7, D.alternatives.length],
      ["Role lenses (flagship)", D.lenses.length, D.lenses.length],
    ] as [string, number, number][],
    leastDeep,
    helpers: listedHelpers(),
  };
}
export const meta: Route.MetaFunction = () => pageMeta("Admin report", undefined, { noindex: true });

const DEMO = {
  zero: [
    ["fix a leaking roof", 41],
    ["okada insurance", 27],
    ["bet9ja", 22],
    ["cac annual returns", 18],
    ["jamb cbt practice", 15],
  ],
  misses: [
    ["keke driver", 12],
    ["aso ebi seller", 9],
    ["pos agent", 7],
    ["phone repairer", 5],
  ],
  links: [
    ["tool: remote africa", "https://remoteafrica.io/", "404 twice"],
    ["resource: kdenlive manual", "https://docs.kdenlive.org/", "timeout"],
  ],
  suggestions: [
    ["Price changed", 14],
    ["My job isn't listed", 11],
    ["Write a path for my job", 9],
    ["Broken link", 4],
  ],
};

export default function AdminReport({ loaderData: d }: Route.ComponentProps) {
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">Internal · not indexed</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>
        Admin report
      </h1>
      <div className="banner info" style={{ marginTop: 14 }}>
        <Icon name="info" />
        <div className="fl1 t-sm">
          <b>Catalogue numbers are real.</b> <span className="mu">Visitor signals (searches, misses, links, suggestions, helper starts) are sample data until event storage is connected.</span>
        </div>
      </div>
      <div className="grid c6" style={{ marginTop: 18 }}>
        {d.kpis.map(([l, n]) => (
          <div key={l} className="card pad">
            <div className="t-stat">{n.toLocaleString("en-GB")}</div>
            <div className="t-xs su">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid c2" style={{ marginTop: 16 }}>
        <div className="card pad">
          <h2 className="t-h4">Catalogue quality</h2>
          {d.quality.map(([l, n, of]) => (
            <div key={l} className="row g12" style={{ padding: "10px 0" }}>
              <span className="t-sm b6" style={{ width: 200 }}>
                {l}
              </span>
              <Prog className="fl1" value={of ? n / of : 0} />
              <span className="t-mono t-xs su">
                {n}/{of}
              </span>
            </div>
          ))}
        </div>
        <div className="card pad">
          <h2 className="t-h4">Most-needed, least-deep</h2>
          <p className="t-xs su">Tools many roles use whose learning path is still a general guide. Write these next.</p>
          <div className="list" style={{ marginTop: 6 }}>
            {d.leastDeep.map((t) => (
              <Link key={t.slug} className="li" to={`/tools/${t.slug}/roadmap`}>
                <ToolLogo slug={t.slug} size="sm" />
                <span className="t-sm b6 fl1">{t.name}</span>
                <span className="t-xs su">{t.reach.toLocaleString("en-GB")} roles</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="grid c3" style={{ marginTop: 16 }}>
        <div className="card pad">
          <div className="row sb">
            <h2 className="t-h4">Top zero-result searches</h2>
            <Tag hue="slate">Sample</Tag>
          </div>
          <div className="list" style={{ marginTop: 6 }}>
            {DEMO.zero.map(([q, n]) => (
              <div key={q} className="li t-sm">
                <span className="fl1">{q}</span>
                <span className="t-mono su">{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card pad">
          <div className="row sb">
            <h2 className="t-h4">Roles people looked for</h2>
            <Tag hue="slate">Sample</Tag>
          </div>
          <p className="t-xs su">Seen 3 or more times.</p>
          <div className="list" style={{ marginTop: 6 }}>
            {DEMO.misses.map(([q, n]) => (
              <div key={q} className="li t-sm">
                <span className="fl1">{q}</span>
                <span className="t-mono su">{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card pad">
          <div className="row sb">
            <h2 className="t-h4">Open suggestions</h2>
            <Tag hue="slate">Sample</Tag>
          </div>
          <div className="list" style={{ marginTop: 6 }}>
            {DEMO.suggestions.map(([q, n]) => (
              <div key={q} className="li t-sm">
                <span className="fl1">{q}</span>
                <span className="t-mono su">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid c2" style={{ marginTop: 16 }}>
        <div className="card pad">
          <div className="row sb">
            <h2 className="t-h4">Broken links</h2>
            <Tag hue="slate">Sample</Tag>
          </div>
          <div className="list" style={{ marginTop: 6 }}>
            {DEMO.links.map(([w, u, why]) => (
              <div key={u} className="li t-sm">
                <span className="fl1">
                  <b>{w}</b>
                  <span className="t-xs su" style={{ display: "block" }}>
                    {u}
                  </span>
                </span>
                <Tag hue="coral">{why}</Tag>
              </div>
            ))}
          </div>
        </div>
        <div className="card pad">
          <div className="row sb">
            <h2 className="t-h4">Helpers this week</h2>
            <Tag hue="slate">Sample</Tag>
          </div>
          <div className="list" style={{ marginTop: 6 }}>
            {d.helpers.map((h, i) => (
              <div key={h} className="li t-sm">
                <span className="fl1 b6">{h.replace(/-/g, " ")}</span>
                <span className="su">
                  {[38, 24, 17][i] ?? 10} starts · {[12, 9, 5][i] ?? 3} stages done
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
