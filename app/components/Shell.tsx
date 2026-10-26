// App shell (reference markup: header.hdr, nav.tabbar, footer.ftr, .helperbar + .coach, sign-in sheet).
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { BRAND, flag, listedHelpers } from "../lib/build";
import { accountActions, deviceActions, getRetention, getTheme, helperActions, retentionActions, sessionGet, sessionSet, setTheme, useAccount, useDevice, useHelperState, useHydrated, useTheme, useTicks } from "../lib/store";
import { fetchJson } from "../lib/indexes";
import { BrandMark, Icon, Illustration, Prog, Sheet } from "./da";

const NAV = [
  { to: "/for", label: "Explore" },
  { to: "/goals", label: "Goals", flag: "goals" },
  { to: "/kits", label: "Kits", flag: "kits" },
  { to: "/skills", label: "Skills", flag: "explore_skills" },
  { to: "/helpers", label: "Helpers", flag: "helpers" },
];

const active = (path: string, to: string) => path === to || path.startsWith(to + "/");

export function openSignIn() {
  window.dispatchEvent(new CustomEvent("da:signin"));
}

export function Header() {
  const loc = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const account = useAccount();
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("/search");
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [navigate]);
  const dark = hydrated && (theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches));
  return (
    <header className="hdr" data-da="header">
      <div className="wrap in">
        <div className="row g32">
          <Link className="brand" to="/" aria-label={`${BRAND} home`}>
            <BrandMark />
            <span className="wm">{BRAND}</span>
            {flag("beta_banner") && <span className="beta">Beta</span>}
          </Link>
          <nav aria-label="Main">
            {NAV.filter((n) => !n.flag || flag(n.flag)).map((n) => (
              <Link key={n.to} to={n.to} aria-current={active(loc.pathname, n.to) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="row g10">
          <Link className="q" to="/search" data-da="global-search">
            <Icon name="search" />
            <span className="fl1">I want to…</span>
            <span className="kbd">⌘K</span>
          </Link>
          <Link className="ib mq" to="/search" aria-label="Search">
            <Icon name="search" />
          </Link>
          <button
            type="button"
            className="ib"
            data-da="theme-toggle"
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => {
              const t = getTheme();
              const isDark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
              setTheme(isDark ? "light" : "dark");
            }}
          >
            <Icon name={dark ? "sun" : "moon"} />
          </button>
          {account ? (
            <Link className="av" to="/me" aria-label={`Your workbench, ${account.name}`} data-da="sign-in-link">
              {account.name[0]}
            </Link>
          ) : (
            <Link
              className="btn s sm"
              to={`${loc.pathname}?signin=1`}
              data-da="sign-in-link"
              onClick={(e) => {
                e.preventDefault();
                openSignIn();
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function TabBar() {
  const loc = useLocation();
  const tabs = [
    { to: "/", label: "Home", icon: "home", on: loc.pathname === "/" },
    { to: "/for", label: "Explore", icon: "compass", on: active(loc.pathname, "/for") || active(loc.pathname, "/skills") || active(loc.pathname, "/tools") },
    { to: "/goals", label: "Goals", icon: "target", on: active(loc.pathname, "/goals") || loc.pathname === "/search" },
    { to: "/kits", label: "Kits", icon: "layers", on: active(loc.pathname, "/kits") },
    { to: "/me", label: "Me", icon: "user", on: active(loc.pathname, "/me") || active(loc.pathname, "/helpers") },
  ];
  return (
    <nav className="tabbar" data-da="tabbar" aria-label="Main">
      {tabs.map((t) => (
        <Link key={t.to} to={t.to} aria-current={t.on ? "page" : undefined}>
          <Icon name={t.icon} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="ftr desk" data-da="footer">
      <div className="wrap row sb as">
        <div className="col g12" style={{ maxWidth: 340 }}>
          <span className="brand">
            <BrandMark />
            <span className="wm">{BRAND}</span>
          </span>
          <span className="t-sm mu">Independent and non-commercial. No ads, no paid placement. Every price shows its source and when we last checked it.</span>
          <span className="t-xs su">Make technology your advantage.</span>
        </div>
        <div className="row g32 as" style={{ gap: 48 }}>
          <div className="col g10">
            <span className="b7 t-sm">Explore</span>
            <Link className="t-sm mu" to="/goals">Goals</Link>
            <Link className="t-sm mu" to="/kits">Kits</Link>
            <Link className="t-sm mu" to="/skills">Skills</Link>
            <Link className="t-sm mu" to="/helpers">Helpers</Link>
            <Link className="t-sm mu" to="/for">Browse everyone</Link>
          </div>
          <div className="col g10">
            <span className="b7 t-sm">Trust</span>
            <Link className="t-sm mu" to="/about/how-we-review">How we review</Link>
            <Link className="t-sm mu" to="/suggest">Suggest an edit</Link>
            <Link className="t-sm mu" to="/whats-new">What's new</Link>
          </div>
          <div className="col g10">
            <span className="b7 t-sm">About</span>
            <Link className="t-sm mu" to="/about">Our mission</Link>
            {flag("contributors_page") && <Link className="t-sm mu" to="/contributors">Contributors</Link>}
            <Link className="t-sm mu" to="/privacy">Privacy</Link>
            <Link className="t-sm mu" to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Helper bar (S41, D-100) ----------

export interface PanelHelper {
  slug: string;
  title: string;
  icon: string;
  stages: { n: number; title: string; goal: string; done: number; steps: { tool: string; name: string; what: string; first_win: string }[] }[];
}

export function helperPosition(h: PanelHelper, p: { ticks: Record<string, boolean>; opened: Record<string, boolean> } | undefined) {
  const ticks = p?.ticks ?? {};
  const opened = p?.opened ?? {};
  const count = (s: PanelHelper["stages"][number]) => Array.from({ length: s.done }, (_, i) => ticks[`${s.n}-${i}`]).filter(Boolean).length;
  const doneStages = h.stages.filter((s) => count(s) === s.done).length;
  const stage = h.stages.find((s) => count(s) < s.done) ?? null;
  const next = stage ? (stage.steps.find((st) => !opened[st.tool]) ?? stage.steps[0]) : null;
  return { stage, next, doneStages, total: h.stages.length, finished: !stage };
}

export function useHelperDefs(enabled: boolean) {
  const [defs, setDefs] = useState<PanelHelper[] | null>(null);
  useEffect(() => {
    if (!enabled || defs) return;
    fetchJson<PanelHelper[]>("/data/helpers.json").then(setDefs, () => setDefs([]));
  }, [enabled, defs]);
  return defs;
}

/** True while the helper bar is on screen, so main reserves its height (D-101). */
export function useHelperBarVisible() {
  const state = useHelperState();
  const dev = useDevice();
  return Boolean(flag("helper_panel") && state?.active && !state.paused && !dev?.helperHidden && listedHelpers.includes(state.active));
}

export function HelperBar() {
  const visible = useHelperBarVisible();
  const state = useHelperState();
  const dev = useDevice();
  const defs = useHelperDefs(visible);
  const navigate = useNavigate();
  const loc = useLocation();
  if (!visible || !defs || loc.pathname.startsWith("/report")) return null;
  const h = defs.find((x) => x.slug === state!.active);
  if (!h) return null;
  const pos = helperPosition(h, state!.progress[h.slug]);
  const short = h.title.replace(/^The /, "").replace(/ Helper$/, "");
  const label = pos.finished ? `${short} · Finished` : `${short} · Stage ${pos.stage!.n} of ${pos.total}`;
  return (
    <aside className="helperbar" data-da="helper-bar" aria-label={`Helper: ${label}`}>
      {flag("helper_coachmark") && !dev?.coachSeen && (
        <div className="coach" role="dialog" aria-label="Tip" data-da="helper-coachmark">
          <b>This is your helper.</b> It stays here while you browse. Tap it for your next step, or close it any time.
          <div className="row g8" style={{ marginTop: 10 }}>
            <button type="button" className="btn p sm" onClick={() => deviceActions.coachSeen()}>
              Got it
            </button>
            <button
              type="button"
              className="btn g sm"
              onClick={() => {
                deviceActions.coachSeen();
                deviceActions.hideHelper(true);
              }}
            >
              Hide helper
            </button>
          </div>
        </div>
      )}
      <Link to={`/helpers/${h.slug}`} className="tile sm glass" aria-label={`Open the ${short} helper`}>
        <Icon name={h.icon} />
      </Link>
      <div className="fl1">
        <div className="t-xs" style={{ opacity: 0.7 }}>
          {label}
        </div>
        <div className="b7 t-sm">{pos.finished ? "You've finished this helper" : pos.stage!.title}</div>
        <Prog value={pos.doneStages / pos.total} style={{ marginTop: 6, height: 5 }} />
      </div>
      {pos.next ? (
        <button
          type="button"
          className="btn inv sm"
          onClick={() => {
            helperActions.opened(h.slug, pos.next!.tool);
            navigate(`/tools/${pos.next!.tool}`);
          }}
        >
          Next <Icon name="arrow-right" />
        </button>
      ) : (
        <Link className="btn inv sm" to={`/helpers/${h.slug}`}>
          Open <Icon name="arrow-right" />
        </Link>
      )}
      <button type="button" className="ib glass-line" style={{ background: "transparent", color: "inherit" }} aria-label="Hide helper" onClick={() => deviceActions.hideHelper(true)}>
        <Icon name="x" />
      </button>
    </aside>
  );
}

// ---------- Sign-in sheet (S44). Demo mode: accounts live on this device until the real auth stack ships. ----------

export function SignInSheet() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [params, setParams] = useSearchParams();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const account = useAccount();
  const dev = useDevice();
  const ticks = useTicks();
  const helper = useHelperState();
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener("da:signin", on);
    return () => window.removeEventListener("da:signin", on);
  }, []);
  useEffect(() => {
    if (hydrated && params.get("signin") === "1") setOpen(true);
  }, [hydrated, params]);
  // Prompt triggers (doc 24 §7): 3rd star, 5th ticked module, first finished helper stage. Never on first load,
  // at most once per session, not again for 14 days after "Not now".
  const stars = Object.keys(dev?.stars ?? {}).length;
  const tickCount = Object.values(ticks?.ticks ?? {}).reduce((a, m) => a + Object.values(m).filter(Boolean).length, 0);
  const stageDone = Object.values(helper?.progress ?? {}).some((p) => Object.values(p.ticks).filter(Boolean).length >= 3);
  // Only a change made in this visit can trigger the prompt (never on first load).
  const base = useRef<{ stars: number; ticks: number; stage: boolean } | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (!base.current) {
      base.current = { stars, ticks: tickCount, stage: stageDone };
      return;
    }
    if (account || sessionGet("da.prompted")) return;
    const last = getRetention().promptedAt;
    if (last && Date.now() - Date.parse(last) < 14 * 86400000) return;
    const b = base.current;
    if ((stars === 3 && b.stars < 3) || (tickCount === 5 && b.ticks < 5) || (stageDone && !b.stage)) {
      sessionSet("da.prompted", "1");
      setOpen(true);
    }
  }, [hydrated, account, stars, tickCount, stageDone]);
  const close = (notNow = false) => {
    setOpen(false);
    setSent(false);
    if (notNow) retentionActions.prompted();
    if (params.get("signin")) {
      const p = new URLSearchParams(params);
      p.delete("signin");
      setParams(p, { replace: true, preventScrollReset: true });
    }
  };
  const done = (method: "google" | "email") => {
    accountActions.signIn(method, method === "google" ? email || "demo.user@gmail.com" : email);
    close();
    navigate("/me/welcome");
  };
  return (
    <Sheet open={open} onClose={() => close(true)} labelledBy="si" da="sign-in-sheet">
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Illustration name="sign-in" width={160} height={120} />
      </div>
      <h2 id="si" className="t-h2" style={{ textAlign: "center", marginTop: 6 }}>
        {sent ? "Check your email" : "Keep your progress everywhere"}
      </h2>
      <p className="t-sm mu" style={{ textAlign: "center", marginTop: 6 }}>
        {sent ? `In the live version we send a sign-in link to ${email}. This preview signs you in straight away.` : "Stars, ticks and kit steps follow you to any device. You can keep browsing without an account."}
      </p>
      {sent ? (
        <div className="col g10" style={{ marginTop: 18 }}>
          <button type="button" className="btn p blk lg" onClick={() => done("email")}>
            Open the sign-in link
          </button>
          <button type="button" className="btn g blk" onClick={() => setSent(false)}>
            Use a different email
          </button>
        </div>
      ) : (
        <form
          className="col g10"
          style={{ marginTop: 18 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) setSent(true);
          }}
        >
          <button type="button" className="btn s blk lg" onClick={() => done("google")}>
            <img src="/assets/brand/third-party/google-g.svg" alt="" width={18} height={18} /> Continue with Google
          </button>
          <label className="input">
            <Icon name="mail" />
            <input placeholder="you@example.com" aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" className="btn p blk lg">
            Email me a sign-in link
          </button>
          <button type="button" className="btn g blk" onClick={() => close(true)}>
            Not now
          </button>
        </form>
      )}
      <p className="t-xs su" style={{ textAlign: "center", marginTop: 12 }}>
        For people aged 18 and over. We never post for you or sell your data. Preview: accounts are a demo and stay on this device.
      </p>
    </Sheet>
  );
}
