// Header, MenuDrawer, ThemeToggle, BetaBanner, BottomTabBar and Footer (03 §2, 06 §6 and §12).
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, X, Search, Sun, Moon, Monitor, Home, Compass, Sparkles, Pencil } from "lucide-react";
import { BRAND, BUILD_DATE, flag } from "../lib/build";
import { formatDate } from "~/lib/format";
import { sessionGet, sessionSet, setTheme, useHelperState, useHydrated, useTheme, helperActions, type Theme } from "../lib/store";
import { SearchBox } from "./SearchBox";
import { openSuggest } from "./SuggestSheet";

export function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label={`${BRAND} home`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="wordmark-mark">
        <path d="M5 21 C 10 21, 10 8, 15 8 S 20 16, 23 7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        <circle cx="5" cy="21" r="3" className="node-a" />
        <circle cx="23" cy="7" r="3" className="node-b" />
      </svg>
      <span>{BRAND}</span>
    </Link>
  );
}

const NAV = [
  { to: "/who-are-you", label: "Who are you?" },
  { to: "/helpers", label: "Helpers", flag: "helpers" },
  { to: "/skills", label: "Skills", flag: "explore_skills" },
  { to: "/discover", label: "Discover" },
  { to: "/whats-new", label: "What's new", flag: "whats_new" },
];

export function ThemeToggle() {
  const theme = useTheme();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const opts: { v: Theme; label: string; I: typeof Sun }[] = [
    { v: "system", label: "System", I: Monitor },
    { v: "light", label: "Light", I: Sun },
    { v: "dark", label: "Dark", I: Moon },
  ];
  return (
    <div className="theme-toggle" ref={ref}>
      <button type="button" className="icon-btn" aria-label={`Theme: ${hydrated ? theme : "system"}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon size={20} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="menu">
          {opts.map(({ v, label, I }) => (
            <button key={v} role="menuitemradio" aria-checked={theme === v} className="menu-item" type="button" onClick={() => {
              setTheme(v);
              setOpen(false);
            }}>
              <I size={18} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const theme = useTheme();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="drawer" aria-label="Menu" onClose={onClose} onCancel={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="drawer-inner">
        <div className="sheet-head">
          <Wordmark />
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose} autoFocus>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Menu">
          <ul className="drawer-nav">
            {[...NAV, { to: "/learn", label: "Learn" }, { to: "/tools", label: "Tools A–Z" }, { to: "/about", label: "About" }, { to: "/report", label: "Report an issue" }]
              .filter((n) => !("flag" in n) || !n.flag || flag(n.flag))
              .map((n) => (
                <li key={n.to}>
                  <Link to={n.to} onClick={onClose}>
                    {n.label}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
        <fieldset className="field">
          <legend className="label">Theme</legend>
          {(["system", "light", "dark"] as Theme[]).map((t) => (
            <label key={t} className="check">
              <input type="radio" name="theme" checked={theme === t} onChange={() => setTheme(t)} /> {t[0].toUpperCase() + t.slice(1)}
            </label>
          ))}
        </fieldset>
      </div>
    </dialog>
  );
}

export function Header() {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const helper = useHelperState();
  useEffect(() => setMenu(false), [loc.pathname]);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="header-inner">
        <Wordmark />
        <nav aria-label="Main" className="main-nav">
          <ul>
            {NAV.filter((n) => !n.flag || flag(n.flag)).map((n) => (
              <li key={n.to}>
                <NavLink to={n.to}>{n.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-tools">
          {helper?.active && helper.paused && flag("helper_panel") && (
            <button type="button" className="btn btn-tertiary btn-sm header-resume" onClick={() => helperActions.resume()}>
              Resume helper
            </button>
          )}
          <div className="header-search">
            <SearchBox variant="header" />
          </div>
          <Link to="/search" className="icon-btn header-search-icon" aria-label="Search">
            <Search size={20} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <button type="button" className="icon-btn menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(true)}>
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
      <MenuDrawer open={menu} onClose={() => setMenu(false)} />
    </header>
  );
}

export function BetaBanner() {
  const hydrated = useHydrated();
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(sessionGet("da.beta.dismissed") === "1"), []);
  if (!flag("beta_banner") || hidden) return null;
  return (
    <div className="beta-banner" role="region" aria-label="Early version">
      <p>
        Early version: help us improve it →{" "}
        <a
          href="/suggest"
          onClick={(e) => {
            if (!hydrated) return;
            e.preventDefault();
            openSuggest();
          }}
        >
          Suggest an edit
        </a>
      </p>
      <button type="button" className="icon-btn" aria-label="Dismiss for this visit" onClick={() => {
        sessionSet("da.beta.dismissed", "1");
        setHidden(true);
      }}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function BottomTabBar() {
  const loc = useLocation();
  const tabs = [
    { to: "/", label: "Home", I: Home, match: (p: string) => p === "/" },
    ...(flag("helpers") ? [{ to: "/helpers", label: "Helpers", I: Compass, match: (p: string) => p.startsWith("/helpers") }] : []),
    { to: "/skills", label: "Skills", I: Sparkles, match: (p: string) => p.startsWith("/skills") },
  ];
  return (
    <nav aria-label="Quick" className="tab-bar">
      <ul>
        {tabs.map(({ to, label, I, match }) => (
          <li key={to}>
            <Link to={to} aria-current={match(loc.pathname) ? "page" : undefined} className="tab">
              <span className="tab-disc">
                <I size={20} aria-hidden="true" />
              </span>
              {label}
            </Link>
          </li>
        ))}
        {flag("suggest_edit") && (
          <li>
            <a
              href="/suggest"
              className="tab"
              onClick={(e) => {
                e.preventDefault();
                openSuggest();
              }}
            >
              <span className="tab-disc">
                <Pencil size={20} aria-hidden="true" />
              </span>
              Suggest
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}

export function Footer() {
  const cols = [
    { title: "Explore", links: [["/discover", "Discover"], ["/tasks", "Tasks"], ["/tools", "Tools A–Z"], ["/playbooks", "Playbooks"], ["/who-are-you", "Browse everyone"]] },
    {
      title: "Trust",
      links: [["/about/editorial-standards", "Editorial standards"], ["/about/how-we-review", "How we review"], ["/report", "Report an issue"], ["/suggest", "Suggest an edit"], ["/whats-new", "What's new"], ...(flag("contributors_page") ? [["/contributors", "Contributors"]] : [])],
    },
    { title: "About", links: [["/about", "About"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/accessibility", "Accessibility"]] },
  ];
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Wordmark />
          <p>Helping everyone find the right digital tools for their work and life, and learn to use them.</p>
        </div>
        {cols.map((c) => (
          <details key={c.title} className="footer-col" open>
            <summary>{c.title}</summary>
            <ul>
              {c.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      <p className="footer-bottom">
        Non-commercial. No ads, sponsors or affiliate links. · Text CC BY 4.0 · Built {formatDate(BUILD_DATE)}
      </p>
    </footer>
  );
}
