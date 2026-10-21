// S27 Identity toolkit /for/{identity}; combined toolkit /for/{a}+{b}[+{c}] (client-rendered, noindex).
import { useState } from "react";
import { Link, data } from "react-router";
import { ArrowRight, Printer, Share2 } from "lucide-react";
import type { Route } from "./+types/for.$identity";
import { toolkitData, type NeedCardData, type ToolkitData } from "~/lib/content.server";
import { BRAND, flag, meta as pageMeta } from "../lib/build";
import { Breadcrumb, ChipList, NeedCard, PageHeader, TrustFooter } from "../components/ui";
import { fetchJson } from "../lib/indexes";
import { helperActions } from "../lib/store";

export function loader({ params }: Route.LoaderArgs) {
  const d = toolkitData(params.identity);
  if (!d) throw data("Not found", { status: 404 });
  return { kind: "single" as const, ...d };
}

interface IdFile {
  identity: { slug: string; label: string; plural: string; pluralTitle: string };
  sector: { slug: string; label: string };
  resolved: { core: string[]; sector: string[]; universal: string[] };
}

export async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {
  if (!params.identity.includes("+")) return serverLoader();
  const slugs = [...new Set(params.identity.split("+"))].slice(0, 3);
  try {
    const [cards, ...ids] = await Promise.all([
      fetchJson<Record<string, NeedCardData>>("/data/need-cards.json"),
      ...slugs.map((s) => fetchJson<IdFile>(`/data/id/${s}.json`)),
    ]);
    const shared = ids[0].resolved.core.filter((n) => ids.slice(1).every((x) => x.resolved.core.includes(n)));
    return {
      kind: "combined" as const,
      members: ids.map((x) => ({
        ...x,
        core: x.resolved.core.filter((n) => !shared.includes(n)).map((n) => cards[n]),
        sectorNeeds: x.resolved.sector.map((n) => cards[n]),
      })),
      shared: shared.map((n) => cards[n]),
      universal: ids[0].resolved.universal.map((n) => ({ ...cards[n], tools: cards[n].tools.slice(0, 2) })),
    };
  } catch {
    throw data("Not found", { status: 404 });
  }
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <div className="container skeleton-page" aria-busy="true" aria-label="Loading toolkit" />;
}

export const meta: Route.MetaFunction = ({ data: d }) => {
  if (!d) return pageMeta("Not found");
  if (d.kind === "combined") return pageMeta(`Digital toolkit for ${d.members.map((m) => m.identity.plural).join(" and ")}`, undefined, { noindex: true });
  return [
    { title: `Digital tools and skills for ${d.identity.plural} — ${BRAND}` },
    ...pageMeta("", `The needs of ${d.identity.plural}' work, the tools that meet each one, and a three-level way to learn them.`).slice(1),
  ];
};

export default function Toolkit({ loaderData: d }: Route.ComponentProps) {
  if (d.kind === "combined") return <Combined d={d} />;
  return <Single d={d} />;
}

function Single({ d }: { d: ToolkitData }) {
  const id = { slug: d.identity.slug, plural: d.identity.plural };
  const [showSector, setShowSector] = useState(false);
  const [showUni, setShowUni] = useState(false);
  const sectorList = showSector ? d.sectorNeeds : d.sectorNeeds.slice(0, 6);
  const uniList = showUni ? d.universal : d.universal.slice(0, 8);
  return (
    <div className="container">
      <Breadcrumb
        items={[
          { to: `/sectors/${d.sector.slug}`, label: d.sector.label },
          ...(d.family ? [{ label: d.family.label }] : []),
          ...(d.parent ? [{ to: `/for/${d.parent.slug}`, label: d.parent.label }] : []),
          { label: d.identity.label },
        ]}
      />
      <PageHeader
        eyebrow={d.sector.label}
        title={<>Digital toolkit for {d.identity.plural}</>}
        lead={`The work ${d.identity.plural} do, the tools that help with each part, and where to start learning. ${d.family ? `Part of ${d.family.label.toLowerCase()} in ${d.sector.label}.` : ""}`}
      >
        {d.parent && (
          <p>
            Part of <Link to={`/for/${d.parent.slug}`}>{d.parent.label}</Link>
          </p>
        )}
        {d.specialisms.length > 0 && (
          <div className="header-chips">
            <p className="label">Specialisms</p>
            <ChipList items={d.specialisms.map((s) => ({ to: `/for/${s.slug}`, label: s.label }))} />
          </div>
        )}
        <div className="header-actions">
          {d.helper ? (
            <Link className="btn btn-cta" to={`/helpers/${d.helper.slug}`} onClick={() => helperActions.start(d.helper!.slug)}>
              Follow the {d.helper.title.replace(/^The /, "")} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            flag("helpers") && (
              <Link className="link-strong" to="/helpers">
                Browse helpers <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )
          )}
        </div>
      </PageHeader>

      <section className="section" aria-labelledby="h-core">
        <h2 id="h-core">Core to your work</h2>
        {d.core.length ? (
          <ul className="card-grid">
            {d.core.map((n) => (
              <li key={n.slug}>
                <NeedCard n={n} identity={id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="meta">We're still writing the needs that are specific to this work. The sector and everyday needs below already apply.</p>
        )}
      </section>

      {d.sectorNeeds.length > 0 && (
        <section className="section" aria-labelledby="h-sector">
          <h2 id="h-sector">Shared across {d.sector.label}</h2>
          <ul className="card-grid">
            {sectorList.map((n) => (
              <li key={n.slug}>
                <NeedCard n={n} identity={id} />
              </li>
            ))}
          </ul>
          {d.sectorNeeds.length > 6 && (
            <button type="button" className="btn btn-secondary" aria-expanded={showSector} onClick={() => setShowSector(!showSector)}>
              {showSector ? "Show fewer" : `Show all ${d.sectorNeeds.length}`}
            </button>
          )}
        </section>
      )}

      <section className="section" aria-labelledby="h-uni">
        <h2 id="h-uni">Everyone benefits</h2>
        <ul className="card-grid card-grid-compact">
          {uniList.map((n) => (
            <li key={n.slug}>
              <NeedCard n={n} identity={id} compact />
            </li>
          ))}
        </ul>
        {d.universal.length > 8 && (
          <button type="button" className="btn btn-secondary" aria-expanded={showUni} onClick={() => setShowUni(!showUni)}>
            {showUni ? "Show fewer" : `Show all ${d.universal.length}`}
          </button>
        )}
      </section>

      {d.start.length > 0 && (
        <section className="section" aria-labelledby="h-start">
          <h2 id="h-start">Start learning</h2>
          <ul className="start-list">
            {d.start.map((s) => (
              <li key={s.url}>
                <Link to={s.url} className="start-item">
                  <span>{s.title}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.skills.length > 0 && (
        <section className="section" aria-labelledby="h-skills">
          <h2 id="h-skills">Skills you'll use</h2>
          <ChipList items={d.skills.map((s) => ({ to: `/skills/${s.slug}`, label: s.label }))} />
        </section>
      )}

      {flag("toolkit_cards") && <ShareCard d={d} />}

      {d.related.length > 0 && (
        <section className="section" aria-labelledby="h-related">
          <h2 id="h-related">Related work</h2>
          <ChipList items={d.related.map((s) => ({ to: `/for/${s.slug}`, label: s.label }))} />
        </section>
      )}

      <TrustFooter validation={d.identity.validation} kind="identity" note="The needs and tools for each profession are AI-drafted and waiting for a practitioner's review." />
    </div>
  );
}

function ShareCard({ d }: { d: ToolkitData }) {
  const rows = [...d.core, ...d.sectorNeeds].slice(0, 6);
  const text = `Digital toolkit for ${d.identity.plural}:\n${rows.map((r) => `• ${r.label}: ${r.tools[0]?.name ?? ""}`).join("\n")}`;
  const [copied, setCopied] = useState(false);
  return (
    <section className="section toolkit-card" aria-labelledby="h-share">
      <h2 id="h-share">Helping a {d.identity.label.toLowerCase()}?</h2>
      <ol className="toolkit-rows">
        {rows.map((r) => (
          <li key={r.slug}>
            <strong>{r.label}</strong> → {r.tools[0]?.name ?? "—"}
          </li>
        ))}
      </ol>
      <div className="form-actions no-print">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={async () => {
            const url = location.href;
            try {
              if (navigator.share) await navigator.share({ title: document.title, text, url });
              else {
                await navigator.clipboard.writeText(`${text}\n${url}`);
                setCopied(true);
              }
            } catch {
              /* cancelled */
            }
          }}
        >
          <Share2 size={18} aria-hidden="true" /> Share
        </button>
        <a className="btn btn-secondary" href={`https://wa.me/?text=${encodeURIComponent(text + "\n")}`} target="_blank" rel="noopener noreferrer">
          WhatsApp text
        </a>
        <button type="button" className="btn btn-tertiary" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" /> Print
        </button>
        {copied && <span role="status">Copied</span>}
      </div>
    </section>
  );
}

function Combined({ d }: { d: Extract<Route.ComponentProps["loaderData"], { kind: "combined" }> }) {
  const [tab, setTab] = useState(0);
  const m = d.members[tab];
  const names = d.members.map((x) => x.identity.plural);
  return (
    <div className="container">
      <PageHeader title={<>Digital toolkit for {names.join(" and ")}</>} lead="One toolkit for everything you do. Needs you share come first." />
      {d.shared.length > 0 && (
        <section className="section" aria-labelledby="h-shared">
          <h2 id="h-shared">Shared by {d.members.length === 2 ? "both" : "all"}</h2>
          <ul className="card-grid">
            {d.shared.map((n) => (
              <li key={n.slug}>
                <NeedCard n={n} identity={{ slug: d.members[0].identity.slug, plural: d.members[0].identity.plural }} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <div role="tablist" aria-label="Toolkits" className="explore-tabs">
        {d.members.map((x, i) => (
          <button key={x.identity.slug} role="tab" type="button" aria-selected={i === tab} className="explore-tab" onClick={() => setTab(i)}>
            {x.identity.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <section className="section">
          <h2>Core to {m.identity.plural}' work</h2>
          <ul className="card-grid">
            {m.core.map((n) => (
              <li key={n.slug}>
                <NeedCard n={n} identity={{ slug: m.identity.slug, plural: m.identity.plural }} />
              </li>
            ))}
          </ul>
          <p>
            <Link className="link-strong" to={`/for/${m.identity.slug}`}>
              Full toolkit for {m.identity.plural} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>
        </section>
      </div>
      <section className="section">
        <h2>Everyone benefits</h2>
        <ul className="card-grid card-grid-compact">
          {d.universal.map((n) => (
            <li key={n.slug}>
              <NeedCard n={n} compact />
            </li>
          ))}
        </ul>
      </section>
      <TrustFooter kind="identity" note="The needs and tools for each profession are AI-drafted and waiting for a practitioner's review." />
    </div>
  );
}
