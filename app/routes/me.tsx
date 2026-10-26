// S45 My workbench (reference 16-workbench): greeting, stats, Continue card, rule-based suggestions with
// "Why these?", skills (learning → can do), starred, and "What changed for you?" (doc 24 §6, §9, §11).
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/me";
import { meta as pageMeta } from "../lib/build";
import { fetchJson } from "../lib/indexes";
import { recommend, type RecoInput } from "../lib/reco";
import { Icon, Prog, Sheet, Tag, Tile, ToolLogo, toast } from "../components/da";
import { openSignIn } from "../components/Shell";
import { deviceActions, getDevice, getRetention, getTicks, retentionActions, useAccount, useDevice, useHelperState, useHydrated, useIdentityMemory, useRetention, useTicks } from "../lib/store";
import type { TrendingFile } from "./trending";

export const meta: Route.MetaFunction = () => pageMeta("My workbench", undefined, { noindex: true });

type Kits = RecoInput["kits"];
type ToolFile = { tool: { slug: string; name: string }; alternatives: { slug: string; name: string }[] };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function Workbench() {
  const hydrated = useHydrated();
  const account = useAccount();
  const dev = useDevice();
  const mem = useIdentityMemory();
  const ticks = useTicks();
  const helper = useHelperState();
  const ret = useRetention();
  const [kits, setKits] = useState<Kits>({});
  const [hints, setHints] = useState<string[]>([]);
  const [core, setCore] = useState<RecoInput["coreGoals"]>([]);
  const [trend, setTrend] = useState<RecoInput["trending"]>([]);
  const [fresh, setFresh] = useState<RecoInput["fresh"]>([]);
  const [tools, setTools] = useState<RecoInput["tools"]>({});
  const [why, setWhy] = useState(false);
  const roles = mem?.slugs ?? [];
  const profile = Boolean(account?.consents?.recommend.on);

  useEffect(() => {
    fetchJson<Kits>("/data/kits.json").then(setKits, () => setKits({}));
    fetchJson<TrendingFile>("/data/trending.json").then((t) => setTrend(t.markets.ng.goals.map((g) => ({ slug: g.slug, label: g.label ?? "", group: g.group }))), () => setTrend([]));
    fetchJson<{ title: string; url?: string; body: string }[]>("/data/whats-new.json").then(setFresh, () => setFresh([]));
  }, []);
  useEffect(() => {
    const s = roles[0]?.slug;
    if (!s) return;
    Promise.all([fetchJson<{ kits: string[]; resolved: { core: string[] } }>(`/data/id/${s}.json`), fetchJson<Record<string, { slug: string; label: string }[]>>("/data/goals-by-need.json")]).then(
      ([id, gbn]) => {
        setHints(id.kits);
        setCore(id.resolved.core.slice(0, 3).flatMap((n) => (gbn[n] ?? []).slice(0, 1).map((g) => ({ ...g, need: "Core to your work" }))));
      },
      () => setHints([]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles[0]?.slug]);
  const learningSlugs = Object.keys(ticks?.ticks ?? {});
  useEffect(() => {
    for (const rm of learningSlugs) if (!tools[rm]) fetchJson<ToolFile>(`/data/tool/${rm}.json`).then((t) => setTools((x) => ({ ...x, [rm]: { name: t.tool.name, alternatives: t.alternatives ?? [] } })), () => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningSlugs.join(",")]);

  const cards = useMemo(() => {
    if (!hydrated) return [];
    const starred = new Set(Object.values(dev?.stars ?? {}).map((s) => `/${s.type === "tool" ? "tools" : s.type === "goal" ? "goals" : "kits"}/${s.slug}`));
    return recommend({
      dev: getDevice(),
      ticks: getTicks(),
      helper,
      ret: getRetention(),
      profile,
      roles,
      kits,
      hints,
      coreGoals: core,
      trending: account?.consents?.trending.on || profile ? trend : [],
      fresh: fresh.filter((f) => f.url && starred.has(f.url)),
      tools,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, dev, ticks, helper, ret, profile, kits, hints, core, trend, fresh, tools, roles.length]);

  const stars = Object.values(dev?.stars ?? {}).sort((a, b) => b.at.localeCompare(a.at));
  const moduleTicks = Object.values(ticks?.ticks ?? {}).reduce((a, m) => a + Object.values(m).filter(Boolean).length, 0);
  const kitSteps = Object.values(dev?.kits ?? {}).reduce((a, s) => a + s.length, 0);
  const paths = Object.entries(ticks?.ticks ?? {}).map(([rm, m]) => ({ rm, n: Object.values(m).filter(Boolean).length })).filter((p) => p.n > 0);
  const last = dev?.last;
  const outcomes = ret?.outcomes ?? [];
  const dismiss = (key: string, label: string) => {
    retentionActions.dismiss(key);
    toast(`Hidden for 30 days: ${label}.`);
  };

  return (
    <section className="wrap" style={{ paddingTop: 26 }}>
      <div className="row sb ae wrapf g16">
        <div>
          <span className="t-label">My workbench</span>
          <h1 className="t-h1" style={{ marginTop: 4 }}>
            {hydrated && account ? `${greeting()}, ${account.name}` : "Your workbench"}
          </h1>
          <div className="row g6 wrapf" style={{ marginTop: 8 }}>
            {hydrated &&
              roles.map((s, i) => (
                <Tag key={s.slug} hue={i === 0 ? "blue" : "pink"} icon="user">
                  {s.label}
                </Tag>
              ))}
            <Link className="t-sm pr b6" to="/">
              {roles.length ? "Edit roles" : "Add your roles"}
            </Link>
            {hydrated && !account && (
              <button type="button" className="t-sm pr b6" style={{ minHeight: 24 }} onClick={openSignIn}>
                · Sign in to keep this everywhere
              </button>
            )}
          </div>
        </div>
        <div className="row g24">
          <div>
            <div className="t-stat">{hydrated ? kitSteps : 0}</div>
            <div className="t-xs su">kit steps done</div>
          </div>
          <div>
            <div className="t-stat">{hydrated ? moduleTicks : 0}</div>
            <div className="t-xs su">modules ticked</div>
          </div>
          <div>
            <div className="t-stat">{hydrated ? stars.length : 0}</div>
            <div className="t-xs su">starred</div>
          </div>
        </div>
      </div>

      <section className="next" style={{ marginTop: 20 }} data-da="continue-card">
        {last?.tool ? <ToolLogo slug={last.tool} size="lg" /> : <Tile icon="route" hue="violet" size="lg" />}
        <div className="fl1">
          <div className="k">{last ? "Continue where you left off" : "Start here"}</div>
          <div className="ttl">{last ? last.title : "Tell us who you are to see your tools"}</div>
          <div className="t-sm" style={{ opacity: 0.7, marginTop: 4 }}>
            {last ? last.kicker : "Saved on this device. No account needed."}
          </div>
        </div>
        <Link className="btn" to={last?.url ?? "/"}>
          {last ? "Continue" : "Start"} <Icon name="arrow-right" />
        </Link>
      </section>

      <div className="row sb wrapf g8" style={{ marginTop: 24 }}>
        <h2 className="t-h3">Suggested for you</h2>
        <span className="t-xs su row g6">
          <Icon name="info" /> {profile ? "Based on your roles, stars and progress." : "Based on what you did on this device."} Rules, not AI.{" "}
          <button type="button" className="pr b6" style={{ minHeight: 24 }} onClick={() => setWhy(true)}>
            Why these?
          </button>
        </span>
      </div>
      <div className="grid c3" style={{ marginTop: 12 }}>
        {cards.map((s) => (
          <article key={s.key} className="card pad el" data-da="suggestion-card">
            <div className="row sb">
              <Tag hue={s.hue} icon={s.icon}>
                {s.tag}
              </Tag>
              <button type="button" className="ib" style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, border: 0 }} aria-label={`Dismiss ${s.title}`} onClick={() => dismiss(s.key, s.title)}>
                <Icon name="x" />
              </button>
            </div>
            <Link className="b7" style={{ marginTop: 10, display: "block" }} to={s.url}>
              {s.title}
            </Link>
            <div className="t-xs su">{s.sub}</div>
            <div className="t-xs mu" style={{ marginTop: 6 }}>
              Why: {s.why}
            </div>
            <div className="row g8" style={{ marginTop: 12 }}>
              <button type="button" className="chip sm" onClick={() => dismiss(s.key, s.title)}>
                Not for me
              </button>
              <button type="button" className="chip sm" onClick={() => dismiss(s.key, s.title)}>
                Already know
              </button>
            </div>
          </article>
        ))}
      </div>
      {hydrated && !profile && (
        <p className="t-xs su" style={{ marginTop: 8 }}>
          {account ? "Turn on \"Use my profile to suggest things\" in Privacy and data for suggestions from your roles and skills." : "Sign in and allow suggestions from your profile to see more."}
        </p>
      )}

      <div className="grid c2" style={{ marginTop: 16 }}>
        <div className="card pad">
          <div className="row sb">
            <h3 className="t-h4">My skills</h3>
            <span className="t-xs su">{paths.length}</span>
          </div>
          {paths.length === 0 && (
            <p className="t-sm mu" style={{ marginTop: 10 }}>
              Tick a module on any learning path and it shows here.
            </p>
          )}
          {paths.slice(0, 8).map((p) => {
            const can = Boolean(dev?.canDo?.[p.rm]);
            return (
              <div key={p.rm} className="row g12" style={{ padding: "10px 0" }}>
                <Link className="t-sm b6" style={{ width: 140 }} to={`/tools/${p.rm}/roadmap`}>
                  {tools[p.rm]?.name ?? p.rm.replace(/-/g, " ")}
                </Link>
                <Prog className="fl1" value={can ? 1 : Math.min(0.9, p.n / 8)} fill={{ background: can ? "var(--da-color-success)" : "var(--da-color-primary)" }} />
                <button type="button" className={`tag ${can ? "h-green" : "h-violet"}`} style={{ width: 96, justifyContent: "center" }} aria-pressed={can} onClick={() => deviceActions.setCanDo(p.rm, !can)} title={can ? "Mark as still learning" : "I can do this now"}>
                  {can ? "Can do" : "Learning"}
                </button>
              </div>
            );
          })}
          {stars
            .filter((s) => s.type === "tool" && !paths.some((p) => p.rm === s.slug))
            .slice(0, 3)
            .map((s) => (
              <div key={s.slug} className="row g12" style={{ padding: "10px 0" }}>
                <Link className="t-sm b6" style={{ width: 140 }} to={`/tools/${s.slug}`}>
                  {s.label}
                </Link>
                <Prog className="fl1" value={0} />
                <span className="tag h-amber" style={{ width: 96, justifyContent: "center" }}>
                  Starred
                </span>
              </div>
            ))}
        </div>
        <div className="card pad">
          <div className="row sb">
            <h3 className="t-h4">Starred</h3>
            <span className="t-xs su">{stars.length}</span>
          </div>
          {stars.length === 0 && (
            <p className="t-sm mu" style={{ marginTop: 10 }}>
              Star tools, goals and kits to keep them here.
            </p>
          )}
          <div className="list" style={{ marginTop: 4 }}>
            {stars.slice(0, 8).map((s) => (
              <Link key={`${s.type}:${s.slug}`} className="li" to={s.type === "tool" ? `/tools/${s.slug}` : s.type === "goal" ? `/goals/${s.slug}` : s.type === "kit" ? `/kits/${s.slug}` : s.type === "helper" ? `/helpers/${s.slug}` : `/for/${s.slug}`}>
                {s.type === "tool" ? <ToolLogo slug={s.slug} size="sm" /> : <Tile icon={s.type === "kit" ? "layers" : s.type === "goal" ? "target" : "user"} hue={s.type === "kit" ? "coral" : "violet"} size="sm" />}
                <span className="t-sm b6 fl1">{s.label}</span>
                <span className="t-xs su">{s.type[0].toUpperCase() + s.type.slice(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card pad" style={{ marginTop: 16 }}>
        <div className="row sb">
          <h3 className="t-h4">What changed for you?</h3>
          <span className="t-xs su">Only you see this</span>
        </div>
        {outcomes.length === 0 ? (
          <p className="t-sm mu" style={{ marginTop: 8 }}>
            When you finish a helper stage or a kit, we'll ask what changed. Your answers show here.
          </p>
        ) : (
          <div className="list" style={{ marginTop: 4 }}>
            {outcomes.slice(0, 6).map((o) => (
              <div key={o.key} className="li t-sm">
                <Icon name="check-circle" />
                <span className="fl1">
                  <b>{o.label}</b>
                  <span className="su"> · {o.value}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="t-xs su" style={{ marginTop: 16 }}>
        {account ? "Preview: your account is a demo kept on this device." : "Everything here is saved only on this device."}{" "}
        <Link className="pr b6" to="/me/profile">
          Privacy and data →
        </Link>
      </p>

      <Sheet open={why} onClose={() => setWhy(false)} labelledBy="why" da="why-sheet">
        <div className="row sb" style={{ marginTop: 12 }}>
          <h2 id="why" className="t-h3">
            Why these suggestions?
          </h2>
          <button type="button" className="ib" aria-label="Close" onClick={() => setWhy(false)}>
            <Icon name="x" />
          </button>
        </div>
        <p className="t-sm mu" style={{ marginTop: 8 }}>
          Suggestions follow simple, fixed rules. There's no AI and nothing is sold. Each card says which rule picked it.
        </p>
        <div className="list" style={{ marginTop: 8 }}>
          {[
            ["Continue", "The last thing you opened."],
            ["Next module / Next level", "The next step in a learning path you're ticking off."],
            ["Starred, not started", "Something you starred more than 3 days ago."],
            ["For your role", "Goals and kits people in your role need."],
            ["Compare", "A common alternative to a tool you're learning."],
            ["Trending / Updated", "What's popular this week, and changes to things you starred."],
            ["Next in your kit / Check first", "The next kit step, and safety checks everyone needs."],
          ].map(([t, d]) => (
            <div key={t} className="li t-sm as" style={{ display: "block" }}>
              <b>{t}</b>
              <div className="mu">{d}</div>
            </div>
          ))}
        </div>
        <p className="t-xs su" style={{ marginTop: 10 }}>
          "Not for me" and "Already know" hide a card for 30 days.
        </p>
      </Sheet>
    </section>
  );
}
