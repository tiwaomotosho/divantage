// S01-R Home (question-led) + S01-R2 "Explore by" switcher + V2.5 helper cards and identity ribbon.
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Form, Link, useNavigate, useSearchParams } from "react-router";
import { ArrowRight, Wrench } from "lucide-react";
import type { Route } from "./+types/home";
import { homeData } from "~/lib/content.server";
import { flag, meta as pageMeta, BRAND } from "../lib/build";
import { IdentityPicker, type PickedIdentity } from "../components/IdentityPicker";
import { identityActions, helperActions, useHelperState, useIdentityMemory } from "../lib/store";
import { HelperCard } from "../components/HelperBits";
import { loadSkillSearch, loadToolNames, useLazy } from "../lib/indexes";
import { useHelperDefs, helperPosition } from "../components/HelperPanel";

export const loader = () => homeData();

export const meta: Route.MetaFunction = () => [
  { title: `${BRAND}: make technology your advantage` },
  ...pageMeta("", "Tell us who you are and get the digital tools, skills and learning paths that fit your work.").slice(1),
];

type Tab = "identity" | "goal" | "skill" | "tool" | "sector";
const TABS: { id: Tab; label: string; flag: string }[] = [
  { id: "identity", label: "Who are you?", flag: "explore_identity" },
  { id: "goal", label: "What do you want to do?", flag: "explore_goal" },
  { id: "skill", label: "Skills", flag: "explore_skills" },
  { id: "tool", label: "Tools", flag: "explore_tools" },
  { id: "sector", label: "Sectors", flag: "explore_sectors" },
];

export default function Home({ loaderData: d }: Route.ComponentProps) {
  const [params] = useSearchParams();
  const tabs = TABS.filter((t) => flag(t.flag));
  const urlTab = params.get("explore") as Tab | null;
  const tab: Tab = tabs.some((t) => t.id === urlTab) ? urlTab! : "identity";
  const navigate = useNavigate();

  function onTabKey(e: KeyboardEvent, i: number) {
    let j = i;
    if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = tabs.length - 1;
    else return;
    e.preventDefault();
    document.getElementById(`tab-${tabs[j].id}`)?.focus();
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <Motif />
          <h1 className="display">Make technology your advantage.</h1>
          <p className="hero-lead">
            Tell us who you are. We'll show the digital tools people like you use, what each one is for, and a step-by-step way to learn it.
          </p>
          <ReturningBanner />
          {tabs.length > 1 && (
            <div role="tablist" aria-label="Explore by" className="explore-tabs">
              {tabs.map((t, i) => (
                <Link
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={tab === t.id ? 0 : -1}
                  to={t.id === "identity" ? "/" : `/?explore=${t.id === "skill" ? "skills" : t.id}`}
                  preventScrollReset
                  replace
                  className="explore-tab"
                  onKeyDown={(e) => onTabKey(e, i)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(t.id === "identity" ? "/" : `/?explore=${t.id === "skill" ? "skills" : t.id}`, { replace: true, preventScrollReset: true });
                  }}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          )}
          <div className="hero-panel" role={tabs.length > 1 ? "tabpanel" : undefined} id={`panel-${tab}`} aria-labelledby={tabs.length > 1 ? `tab-${tab}` : undefined}>
            {tab === "identity" && <IdentityPanel popular={d.popular} />}
            {tab === "goal" && <GoalPanel goals={d.goals} />}
            {tab === "skill" && <SkillPanel groups={d.skillGroups} />}
            {tab === "tool" && <ToolPanel />}
            {tab === "sector" && <SectorPanel sectors={d.sectors} />}
          </div>
        </div>
        <Ribbon items={d.ribbon} />
      </section>

      <div className="container">
        <section className="section" aria-labelledby="h-everyone">
          <h2 id="h-everyone">Everyone gets a digital upgrade</h2>
          <p className="lead">
            {d.counts.identities.toLocaleString("en-GB")} professions and life roles, {d.counts.tools} tools, a three-level course outline for each one.
          </p>
          <ul className="identity-cards">
            {d.cards.map((c) => (
              <li key={c.slug}>
                <Link to={`/for/${c.slug}`} className="identity-card">
                  <span className="identity-card-title">{c.plural}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <p>
            <Link className="link-strong" to="/who-are-you">
              Browse everyone <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>
        </section>

        {flag("helpers") && d.helpers.length > 0 && (
          <section className="section" aria-labelledby="h-helpers">
            <h2 id="h-helpers">Or follow a guide</h2>
            <p className="lead">A helper walks you through the tools for one kind of work, one step at a time.</p>
            <ul className="helper-cards">
              {d.helpers.map((h) => (
                <li key={h.slug}>
                  <HelperCard h={h} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="section" aria-labelledby="h-how">
          <h2 id="h-how">How it works</h2>
          <ol className="how-strip">
            <li>
              <span className="how-node">1</span>
              <h3>Say who you are</h3>
              <p>Pick your work or role. Up to three, if you wear several hats.</p>
            </li>
            <li>
              <span className="how-node">2</span>
              <h3>See your toolkit</h3>
              <p>The needs of your work, and the tools that meet each one.</p>
            </li>
            <li>
              <span className="how-node">3</span>
              <h3>Learn in three levels</h3>
              <p>Beginner, intermediate and expert, adjusted to your work.</p>
            </li>
            <li>
              <span className="how-node">4</span>
              <h3>Share it</h3>
              <p>Help a friend or family member get started too.</p>
            </li>
          </ol>
        </section>

        <section className="section" aria-labelledby="h-goal">
          <h2 id="h-goal">Or jump straight to a goal</h2>
          <ul className="chip-list">
            {d.tasks.map((t) => (
              <li key={t.slug}>
                <Link className="chip" to={`/tasks/${t.slug}`}>
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="trust-strip" aria-label="Our promise">
          <p>
            <strong>Non-commercial.</strong> No ads, sponsors or affiliate links. Who you are stays on your device. Every fact links to its source and review date.{" "}
            <Link to="/about/editorial-standards">How we choose tools</Link>
          </p>
        </section>
      </div>
    </>
  );
}

function IdentityPanel({ popular }: { popular: PickedIdentity[] }) {
  const [sel, setSel] = useState<PickedIdentity[]>([]);
  const [helping, setHelping] = useState(false);
  const navigate = useNavigate();
  const go = () => {
    if (!sel.length) return;
    identityActions.remember(sel);
    navigate(`/for/${sel.map((s) => s.slug).join("+")}`);
  };
  return (
    <Form
      action="/who-are-you"
      className="identity-panel"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <IdentityPicker label={helping ? "Who are you helping?" : "Who are you?"} selected={sel} onChange={setSel} examples={popular} showSkills />
      {flag("helping_mode") && (
        <label className="switch">
          <input type="checkbox" checked={helping} onChange={(e) => setHelping(e.target.checked)} />
          <span className="switch-track" aria-hidden="true" />
          <span>
            I'm helping someone else
            <span className="hint">We'll say "they" instead of "you".</span>
          </span>
        </label>
      )}
      <div className="hero-actions">
        <button type="submit" className="btn btn-cta" disabled={!sel.length} aria-disabled={!sel.length}>
          Show {helping ? "their" : "my"} toolkit <ArrowRight size={20} aria-hidden="true" />
        </button>
        <Link to="/who-are-you" className="link-strong">
          Browse everyone <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </Form>
  );
}

function GoalPanel({ goals }: { goals: { slug: string; label: string }[] }) {
  return (
    <div>
      <h2 className="panel-q">What do you want to do?</h2>
      <ul className="chip-list">
        {goals.map((g) => (
          <li key={g.slug}>
            <Link className="chip" to={`/needs/${g.slug}`}>
              {g.label}
            </Link>
          </li>
        ))}
      </ul>
      <Form method="get" action="/search" className="inline-search">
        <label htmlFor="goal-q" className="sr-only">
          Describe what you want to do
        </label>
        <input id="goal-q" name="q" type="search" placeholder="e.g. edit a video for free" maxLength={120} />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </Form>
    </div>
  );
}

function SkillPanel({ groups }: { groups: { slug: string; label: string }[] }) {
  const [q, setQ] = useState("");
  const [touched, setTouched] = useState(false);
  const s = useLazy(loadSkillSearch, touched);
  const res = useMemo(() => (s.status === "ready" && q.length >= 2 ? s.value!(q, 6) : []), [s, q]);
  return (
    <div>
      <h2 className="panel-q">What do you want to get good at?</h2>
      <label htmlFor="skill-q" className="sr-only">
        Search skills
      </label>
      <input id="skill-q" className="picker-input" type="search" placeholder="e.g. mixing, spreadsheets, research" value={q} onFocus={() => setTouched(true)} onChange={(e) => setQ(e.target.value)} />
      {res.length > 0 && (
        <ul className="result-list">
          {res.map((r) => (
            <li key={r.slug}>
              <Link to={`/skills/${r.slug}`}>{r.label}</Link>
              <span className="meta"> · {r.desc}</span>
            </li>
          ))}
        </ul>
      )}
      <ul className="chip-list">
        {groups.map((g) => (
          <li key={g.slug}>
            <Link className="chip" to={`/skills#${g.slug}`}>
              {g.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolPanel() {
  const [q, setQ] = useState("");
  const [touched, setTouched] = useState(false);
  const t = useLazy(loadToolNames, touched);
  const res = useMemo(() => {
    if (t.status !== "ready" || q.trim().length < 2) return [];
    const lq = q.toLowerCase();
    return t.value!.filter((x) => x.name.toLowerCase().includes(lq)).sort((a, b) => Number(!a.name.toLowerCase().startsWith(lq)) - Number(!b.name.toLowerCase().startsWith(lq))).slice(0, 8);
  }, [t, q]);
  return (
    <div>
      <h2 className="panel-q">Which tool do you want to learn?</h2>
      <label htmlFor="tool-q" className="sr-only">
        Search tools
      </label>
      <input id="tool-q" className="picker-input" type="search" placeholder="e.g. Excel, Canva, Python" value={q} onFocus={() => setTouched(true)} onChange={(e) => setQ(e.target.value)} />
      {res.length > 0 && (
        <ul className="result-list">
          {res.map((r) => (
            <li key={r.slug}>
              <Wrench size={16} aria-hidden="true" /> <Link to={`/tools/${r.slug}`}>{r.name}</Link> · <Link to={`/tools/${r.slug}/roadmap`}>course outline</Link>
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link className="link-strong" to="/tools">
          All tools A–Z <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}

function SectorPanel({ sectors }: { sectors: { slug: string; label: string; hue: string; count: number }[] }) {
  return (
    <div>
      <h2 className="panel-q">Which sector do you work in?</h2>
      <ul className="sector-cards">
        {sectors.map((s) => (
          <li key={s.slug}>
            <Link to={`/sectors/${s.slug}`} className="sector-card" data-hue={s.hue}>
              <span>{s.label}</span>
              <span className="meta">{s.count} roles</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReturningBanner() {
  const mem = useIdentityMemory();
  const helper = useHelperState();
  const defs = useHelperDefs(Boolean(helper?.active));
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => setDismissed(false), [mem]);
  const h = defs?.find((x) => x.slug === helper?.active);
  const pos = h ? helperPosition(h, helper!.progress[h.slug]) : null;
  if (dismissed || ((!mem || !mem.slugs.length) && !pos)) return null;
  return (
    <div className="welcome-back" role="region" aria-label="Welcome back">
      {mem && mem.slugs.length > 0 && (
        <p>
          Welcome back — continue as {mem.slugs.map((s) => s.label).join(" + ")}?{" "}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/for/${mem.slugs.map((s) => s.slug).join("+")}`)}>
            Continue
          </button>{" "}
          <button
            type="button"
            className="btn btn-tertiary btn-sm"
            onClick={() => {
              identityActions.forget();
              setDismissed(true);
            }}
          >
            Not me
          </button>
        </p>
      )}
      {h && pos && !pos.finished && (
        <p>
          Continue the {h.title.replace(/^The /, "")}. Stage {pos.stage!.n} of {h.stages.length}.{" "}
          <Link
            className="btn btn-secondary btn-sm"
            to={`/helpers/${h.slug}`}
            onClick={() => helperActions.resume()}
          >
            Resume
          </Link>
        </p>
      )}
    </div>
  );
}

function Ribbon({ items }: { items: { slug: string; label: string }[] }) {
  const rows = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];
  return (
    <div className="ribbon" aria-label="Some of the people we have toolkits for">
      {rows.map((row, r) => (
        <div key={r} className={`ribbon-row ribbon-row-${r}`}>
          <ul className="ribbon-track">
            {row.map((x) => (
              <li key={x.slug}>
                <Link to={`/for/${x.slug}`} className="ribbon-item">
                  {x.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="ribbon-track ribbon-dup" aria-hidden="true">
            {row.map((x) => (
              <li key={x.slug}>
                <Link to={`/for/${x.slug}`} className="ribbon-item" tabIndex={-1}>
                  {x.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Motif() {
  return (
    <svg className="hero-motif" viewBox="0 0 400 160" aria-hidden="true" focusable="false">
      <path className="motif-path" d="M10 140 C 80 140, 90 40, 170 50 S 260 130, 300 80 S 360 20, 390 30" />
      <circle cx="10" cy="140" r="7" className="motif-node n1" />
      <circle cx="170" cy="50" r="7" className="motif-node n2" />
      <circle cx="300" cy="80" r="7" className="motif-node n3" />
      <circle cx="390" cy="30" r="9" className="motif-node n4" />
    </svg>
  );
}
