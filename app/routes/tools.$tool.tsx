// S09 Tool page (reference 11-tool, 12-tool-unavailable, 20-suggest-edit): logo, TrustLine, price and checks box
// with the Preview explainer, availability banner, paths for your job first, Learn button, who uses it,
// similar tools, Suggest an edit, NextStepCard.
import { useEffect } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/tools.$tool";
import { toolData } from "~/lib/content.server";
import { MARKET_LABEL } from "~/lib/view";
import { flag, meta as pageMeta } from "../lib/build";
import { Crumbs, DepthLabel, Icon, NextStepCard, StarButton, Tile, ToolLogo, TrustLine } from "../components/da";
import { openSuggest } from "../components/SuggestSheet";
import { deviceActions, useDevice, useIdentityMemory } from "../lib/store";

export function loader({ params }: Route.LoaderArgs) {
  const d = toolData(params.tool);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}
export const meta: Route.MetaFunction = ({ data: d }) => (d ? pageMeta(d.tool.name, d.description ?? `How to learn ${d.tool.name}, who uses it, and what it costs.`) : pageMeta("Not found"));

export default function ToolPage({ loaderData: d }: Route.ComponentProps) {
  const dev = useDevice();
  const mem = useIdentityMemory();
  const market = dev?.market ?? "ng";
  const off = d.unavailable && market !== "other" && d.unavailable.notIn.includes(market);
  const role = mem?.slugs[0];
  // Paths for the visitor's job first (P1): a role path for their saved role leads the list.
  const paths = role ? [{ title: `${d.tool.name} for your work: ${role.label}`, url: `/tools/${d.tool.slug}/for/${role.slug}`, modules: 0, hours: 0, depth: { kind: "role" as const, label: "For your job" } }, ...d.paths].slice(0, 3) : d.paths;
  const start = paths[0];
  useEffect(() => {
    deviceActions.visit({ url: `/tools/${d.tool.slug}`, title: d.tool.name, kicker: "Tool", tool: d.tool.slug, at: new Date().toISOString() });
  }, [d.tool.slug, d.tool.name]);
  const host = d.tool.url ? d.tool.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "the official site";

  return (
    <section className="wrap" style={{ paddingTop: 22 }}>
      <Crumbs items={[{ to: "/tools", label: "Tools" }, { label: d.tool.category ?? "Tool" }]} />
      <div className="row g16 as wrapf" style={{ marginTop: 14 }}>
        <ToolLogo slug={d.tool.slug} size="lg" />
        <div className="fl1" style={{ minWidth: 260 }}>
          <h1 className="t-h1">{d.tool.name}</h1>
          {d.tool.publisher && <div className="t-sm su">by {d.tool.publisher}</div>}
          <div style={{ marginTop: 8 }}>
            <TrustLine trust={d.trust} />
          </div>
          {d.description && (
            <p className="t-lg mu" style={{ marginTop: 10, maxWidth: 680 }}>
              {d.description}
            </p>
          )}
        </div>
        <div className="row g10">
          {flag("stars") && <StarButton item={{ type: "tool", slug: d.tool.slug, label: d.tool.name }} />}
          {d.tool.url && (
            <a className="btn s" href={d.tool.url} target="_blank" rel="noopener noreferrer">
              Official site <Icon name="external" />
            </a>
          )}
        </div>
      </div>
      {off && d.unavailable && (
        <div className="banner err" style={{ marginTop: 16 }} data-da="availability-banner">
          <Icon name="alert" />
          <div className="fl1">
            <b>Not available in {MARKET_LABEL[market] ?? "your country"}</b>
            <div className="mu t-sm">{d.unavailable.note} We don't recommend it to visitors there.</div>
            {d.unavailable.instead.length > 0 && (
              <div className="row g8 wrapf" style={{ marginTop: 10 }}>
                <span className="t-xs su">Use instead:</span>
                {d.unavailable.instead.map((t) => (
                  <Link key={t.slug} to={`/tools/${t.slug}`} aria-label={t.name}>
                    <ToolLogo slug={t.slug} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="rail" style={{ marginTop: 22 }}>
        <div className="col g16">
          <div className="card pad" data-da="trust-box">
            <div className="row sb wrapf g8">
              <h2 className="t-h3">Price and checks</h2>
              <Link className="t-sm pr b6" to="/about/how-we-review">
                How we review →
              </Link>
            </div>
            <div className="grid c2" style={{ marginTop: 12 }}>
              <div>
                <div className="t-label">Price</div>
                <div className="b7" style={{ marginTop: 6 }}>
                  {d.trust.note || d.trust.price}
                </div>
                <div className="t-sm mu">Free tier: {d.freeTier === "yes" ? "yes" : d.freeTier === "limited" ? "limited" : d.freeTier === "no" ? "no" : "not confirmed"}.</div>
              </div>
              <div>
                <div className="t-label">Not checked yet</div>
                <div className="t-sm mu" style={{ marginTop: 6 }}>
                  {d.trust.unchecked.join(" · ")}
                </div>
              </div>
            </div>
            {!d.trust.checked && (
              <div className="pv" style={{ marginTop: 14 }} data-da="preview-explainer">
                <Icon name="eye" />
                <span>
                  <b>Preview:</b> {d.trust.partly ? `partly checked (${d.trust.partly}); pricing is still a preview.` : `written from general knowledge and not yet checked against ${host}.`} Confirm before you pay.
                </span>
              </div>
            )}
          </div>
          {paths.length > 0 && (
            <>
              <div className="row sb">
                <h2 className="t-h3">Learn {d.tool.name}</h2>
                <span className="t-xs su">Paths for your job come first</span>
              </div>
              <div className="col g10">
                {paths.map((p) => (
                  <Link key={p.url} className="card pad row g12" to={p.url} data-da="path-card" style={{ padding: "14px 16px" }}>
                    <Tile icon="route" hue="violet" size="sm" />
                    <div className="fl1">
                      <div className="b7 t-sm">{p.title}</div>
                      {p.modules > 0 && (
                        <div className="t-xs su">
                          {p.modules} modules{p.hours ? ` · ≈ ${Math.round(p.hours)} h` : ""}
                        </div>
                      )}
                    </div>
                    <DepthLabel depth={p.depth} />
                  </Link>
                ))}
              </div>
              <Link className="btn p lg" to={start.url} data-da="learn-tool" style={{ alignSelf: "flex-start" }}>
                <Icon name="route" /> Learn {d.tool.name}
              </Link>
            </>
          )}
          {flag("next_step_card") && <NextStepCard next={d.next} />}
        </div>
        <aside className="col g16">
          {d.who.total > 0 && (
            <div className="card pad">
              <div className="t-label">Who uses {d.tool.name}</div>
              <div className="t-stat" style={{ marginTop: 8 }}>
                {d.who.total.toLocaleString("en-GB")} roles
              </div>
              <div className="t-xs su">in {d.who.sectors} sectors</div>
              <div className="row g6 wrapf" style={{ marginTop: 12 }}>
                {d.who.sample.map((s) => (
                  <span key={s} className="chip sm">
                    {s}
                  </span>
                ))}
                {d.who.total > d.who.sample.length && <span className="chip sm">+{(d.who.total - d.who.sample.length).toLocaleString("en-GB")}</span>}
              </div>
            </div>
          )}
          {d.goals.length > 0 && (
            <div className="card pad">
              <div className="t-label">Goals that use it</div>
              <div className="list" style={{ marginTop: 4 }}>
                {d.goals.map((g) => (
                  <Link key={g.slug} className="li t-sm" to={`/goals/${g.slug}`}>
                    <Icon name="target" />
                    <span className="fl1 b6">{g.label}</span>
                    <Icon name="chevron-right" className="cr" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {flag("alternatives") && d.alternatives.length > 0 && (
            <div className="card pad">
              <div className="t-label">Similar tools</div>
              <div className="list" style={{ marginTop: 4 }}>
                {d.alternatives.map((a) => (
                  <Link key={a.slug} className="li" to={`/tools/${a.slug}`}>
                    <ToolLogo slug={a.slug} size="sm" />
                    <span className="t-sm b6 fl1">{a.name}</span>
                    <span className="t-xs su">{a.price}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {d.helpers.length > 0 && (
            <div className="card pad">
              <div className="t-label">On a helper</div>
              <div className="list" style={{ marginTop: 4 }}>
                {d.helpers.map((h) => (
                  <Link key={h.slug} className="li t-sm" to={`/helpers/${h.slug}`}>
                    <Icon name="route" />
                    <span className="fl1 b6">{h.title}</span>
                    <Icon name="chevron-right" className="cr" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {flag("suggest_edit") && (
            <a
              className="row g8 t-sm mu"
              href={`/tools/${d.tool.slug}?suggest=price`}
              data-da="suggest-edit"
              onClick={(e) => {
                e.preventDefault();
                openSuggest({ on: d.tool.name, recordId: d.tool.id });
              }}
            >
              <Icon name="edit" /> Something wrong? <span className="pr b6">Suggest an edit</span>
            </a>
          )}
        </aside>
      </div>
    </section>
  );
}
