// S09 / S09-R Tool page: full profile or registry page, plus Who uses, Surprising uses, roadmap summary and helpers.
import { Link, data, useNavigate } from "react-router";
import { ArrowRight, Check, X } from "lucide-react";
import type { Route } from "./+types/tools.$tool";
import { toolData } from "~/lib/content.server";
import { formatDate, LEVEL_LABEL } from "~/lib/format";
import { flag, meta as pageMeta } from "../lib/build";
import { Breadcrumb, Callout, ExternalA, Monogram, PricingBadge, Section, ToolRow, TrustFooter, WhoUses } from "../components/ui";
import { IdentityPicker } from "../components/IdentityPicker";
import { DepthLabel } from "./tools.$tool.roadmap";
import { helperActions, useHelperState } from "../lib/store";

export function loader({ params }: Route.LoaderArgs) {
  const d = toolData(params.tool);
  if (!d) throw data("Not found", { status: 404 });
  return d;
}

export const meta: Route.MetaFunction = ({ data: d }) =>
  d ? pageMeta(d.tool.name, d.full?.summary ?? d.pilot?.summary ?? `Who uses ${d.tool.name}, and a beginner-to-expert course outline.`) : pageMeta("Not found");

export default function ToolPage({ loaderData: d }: Route.ComponentProps) {
  const navigate = useNavigate();
  const helper = useHelperState();
  const t = d.tool;
  const f = d.full;
  return (
    <div className="container">
      <Breadcrumb items={[{ to: "/tools", label: "Tools" }, ...(t.category ? [{ label: t.category }] : []), { label: t.name }]} />
      <header className="tool-header">
        <Monogram name={t.name} hue={t.hue} size={56} />
        <div>
          <h1>{t.name}</h1>
          {t.publisher && <p className="meta">by {t.publisher}</p>}
          <div className="tool-badges">
            {d.pricing ? <PricingBadge label={d.pricing.label} starts={d.pricing.starts} checked={d.pricing.checked} /> : <span className="badge badge-ghost">{f || d.pilot ? "Guide in progress" : "Profile coming soon"}</span>}
            {d.roadmap && <DepthLabel depth={d.roadmap.depth} />}
          </div>
        </div>
        {t.url && <ExternalA href={t.url}>Official site</ExternalA>}
      </header>

      {f?.availability && f.availability !== "active" && <Callout tone="warning">Availability: {f.availability}. Check the official site.</Callout>}
      {f && <p className="lead reading">{f.summary}</p>}
      {!f && d.pilot && <p className="lead reading">{d.pilot.summary}</p>}
      {!f && !d.pilot && t.note && <p className="meta reading">{t.note}</p>}

      {flag("helpers") && d.helpers.length > 0 && (
        <Section title="Where this fits" id="h-fits">
          <ul className="fits">
            {d.helpers.map((h) => (
              <li key={h.slug} className="fit-row">
                <p>
                  <strong>{h.title}</strong>, stage {h.stage}: {h.stageTitle}. {h.what}
                </p>
                {helper?.active === h.slug ? (
                  <Link to={`/helpers/${h.slug}#stage-${h.stage}`} className="link-strong">
                    Back to your helper <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ) : (
                  <Link to={`/helpers/${h.slug}`} className="link-strong" onClick={() => helperActions.start(h.slug)}>
                    Start the {h.title.replace(/^The /, "")} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {f && (
        <>
          <Section title={`About ${t.name}`} id="h-about">
            <p className="reading">{f.description}</p>
          </Section>
          {d.pricing && (
            <Section title="Cost" id="h-cost">
              <p className="reading">{d.pricing.details}</p>
              {d.pricing.paid && <p className="reading">{d.pricing.paid}</p>}
              {d.pricing.points.length > 0 && (
                <ul className="reading bullets">
                  {d.pricing.points.map((p: any) => (
                    <li key={p.plan}>
                      {p.plan}: {p.amount} {p.currency} per {p.period} ({p.region}){p.note ? `. ${p.note}` : ""}
                    </li>
                  ))}
                </ul>
              )}
              <p className="meta">
                Checked {formatDate(d.pricing.checked)}. <Link to="/about/how-we-review#pricing-labels">What the price labels mean</Link>
              </p>
            </Section>
          )}
          <Section title="Platforms" id="h-platforms">
            {f.platforms ? <p>{f.platforms.join(" · ")}</p> : <p className="meta unconfirmed"><Link to="/about/how-we-review#platforms">Platform not confirmed</Link></p>}
          </Section>
          <div className="two-col">
            <Section title="Best for" id="h-best">
              <ul className="ticks">
                {f.bestFor.map((x: string) => (
                  <li key={x}>
                    <Check size={18} aria-hidden="true" /> {x}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="May not be ideal if you need" id="h-not">
              <ul className="ticks ticks-x">
                {f.notIdeal.map((x: string) => (
                  <li key={x}>
                    <X size={18} aria-hidden="true" /> {x}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
          {(f.capabilities.length > 0 || f.limitations.length > 0) && (
            <Section title="What it can and can't do" id="h-caps">
              <ul className="reading bullets">
                {[...f.capabilities, ...f.limitations].map((c: any) => (
                  <li key={c.text}>
                    {c.text}
                    {c.kind === "editorial" && <span className="badge badge-neutral badge-xs">Our view</span>}
                    {c.source_ids?.map((s: string) => {
                      const i = f.sources.findIndex((x: any) => x.id === s);
                      return i >= 0 ? (
                        <sup key={s}>
                          <a href={`#src-${s}`}>[{i + 1}]</a>
                        </sup>
                      ) : null;
                    })}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {f.gettingStarted.length > 0 && (
            <Section title="Getting started" id="h-start">
              <ol className="steps-simple">
                {f.gettingStarted.map((s: string) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </Section>
          )}
        </>
      )}

      {!f && d.pilot && (
        <>
          <Callout tone="info" title="Guide in progress">
            <p>This guide is an AI draft waiting for a human check. We don't show prices or platforms until they're verified on the official site.</p>
          </Callout>
          <div className="two-col">
            <Section title="Good for" id="h-best">
              <ul className="ticks">
                {d.pilot.best_for.map((x) => (
                  <li key={x}>
                    <Check size={18} aria-hidden="true" /> {x}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Your first hour" id="h-first">
              <ol className="steps-simple">
                {d.pilot.first_hour.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
            </Section>
          </div>
          <div className="two-col">
            <Section title="Watch out for" id="h-watch">
              <ul className="reading bullets">
                {d.pilot.watch_out.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Section>
            <Section title="Learn next" id="h-next">
              <ul className="reading bullets">
                {d.pilot.learn_next.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Section>
          </div>
        </>
      )}

      <Section title={`Who uses ${t.name}`} id="h-who" lead={d.whoTotal ? `${d.whoTotal.toLocaleString("en-GB")} professions and roles have ${t.name} in their toolkit.` : undefined}>
        <WhoUses groups={d.who} tool={t.name} />
      </Section>

      {d.surprising.length > 0 && (
        <Section title="Surprising uses" id="h-surprising">
          <ul className="surprise-cards">
            {d.surprising.map((s: any) => (
              <li key={s.sector} className="surprise-card">
                <p className="surprise-quote">
                  {s.identity.plural[0].toUpperCase() + s.identity.plural.slice(1)} use {t.name} to {s.needLabel[0].toLowerCase() + s.needLabel.slice(1)}
                </p>
                <p className="meta">{s.sector}</p>
                {s.lens ? <Link to={`/tools/${t.slug}/for/${s.need}`}>See the path</Link> : <Link to={`/for/${s.identity.slug}/${t.slug}`}>See how</Link>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {d.roadmap && (
        <Section title="Skill roadmap" id="h-roadmap">
          <ol className="roadmap-summary">
            {d.roadmap.firsts.map((x) => (
              <li key={x.level} data-level={x.level}>
                <p className="label">
                  {LEVEL_LABEL[x.level]} · {x.count} modules
                </p>
                <p>{x.title}</p>
              </li>
            ))}
          </ol>
          <div className="form-actions">
            <Link className="btn btn-primary" to={`/tools/${t.slug}/roadmap`}>
              See the full outline
            </Link>
          </div>
          <div className="tailor-bar">
            <IdentityPicker label="See it for your work: who are you?" max={1} onPick={(p) => navigate(`/for/${p.slug}/${t.slug}`)} placeholder="e.g. teacher, farmer, analyst" />
          </div>
        </Section>
      )}

      {d.lenses.length > 0 && (
        <Section title={`${t.name} for specific work`} id="h-lenses">
          <ul className="start-list">
            {d.lenses.slice(0, 12).map((l) => (
              <li key={l.need}>
                <Link to={`/tools/${t.slug}/for/${l.need}`} className="start-item">
                  <span>
                    {l.title}
                    {l.flagship && <span className="badge badge-accent badge-xs">Written for this work</span>}
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {f && f.alternatives.length > 0 && (
        <Section title={`Alternatives to ${t.name}`} id="h-alt">
          <ul className="tool-rows">
            {f.alternatives.map((a: any) => (
              <ToolRow key={a.slug} t={a} />
            ))}
          </ul>
        </Section>
      )}
      {f && f.tasks.length > 0 && (
        <Section title="Related how-tos" id="h-tasks">
          <ul className="start-list">
            {f.tasks.map((x: any) => (
              <li key={x.slug}>
                <Link to={`/tasks/${x.slug}`} className="start-item">
                  <span>{x.title}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <TrustFooter
        validation={f ? "pending" : (d.pilot?.review_status ?? "pending")}
        reviewed={f?.editorial?.last_verified_at}
        sources={f?.sources}
        kind="tool"
        recordId={t.id}
        note={f ? undefined : "Registry entry: name and official link only. No pricing, platform or feature claims until profiled."}
      />
    </div>
  );
}
