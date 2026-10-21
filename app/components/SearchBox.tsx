// SearchField + SuggestionPanel (06 §6). Groups: People (max 3) · Skills (max 2) · tool×identity route · Tools · Guides (03 §7.3).
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Form, useNavigate } from "react-router";
import { Search, X, User, Sparkles, Wrench, BookOpen, ArrowRight } from "lucide-react";
import { routeToolForIdentity } from "~/lib/search";
import { loadContentSearch, loadIdentitySearch, loadSkillSearch, loadToolNames, useLazy } from "../lib/indexes";

type Sug = { group: string; title: string; sub?: string; url: string; icon: "person" | "skill" | "tool" | "guide" | "route" };

export function SearchBox({ variant = "header", defaultValue = "", autoFocus, label = "Search" }: { variant?: "hero" | "header" | "page"; defaultValue?: string; autoFocus?: boolean; label?: string }) {
  const id = useId().replace(/:/g, "");
  const [q, setQ] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const ids = useLazy(loadIdentitySearch, touched);
  const skills = useLazy(loadSkillSearch, touched);
  const content = useLazy(loadContentSearch, touched);
  const tools = useLazy(loadToolNames, touched);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setQ(defaultValue), [defaultValue]);

  const sugs: Sug[] = useMemo(() => {
    if (q.trim().length < 2) return [];
    const out: Sug[] = [];
    if (ids.status === "ready") {
      for (const h of ids.value!(q, 3)) out.push({ group: "You are a…", title: h.label, sub: `${h.family} › ${h.sector}`, url: `/for/${h.slug}`, icon: "person" });
      if (tools.status === "ready") {
        const r = routeToolForIdentity(q, tools.value!, (x) => ids.value!(x, 1));
        if (r) out.unshift({ group: "Go straight to", title: `How ${r.identity}s use ${r.tool}`, url: r.url, icon: "route" });
      }
    }
    if (skills.status === "ready") for (const s of skills.value!(q, 2)) out.push({ group: "Skills", title: s.label, sub: s.desc, url: `/skills/${s.slug}`, icon: "skill" });
    if (content.status === "ready") {
      const res = content.value!(q).results;
      for (const r of res.filter((x) => x.type === "tool").slice(0, 3)) out.push({ group: "Tools", title: r.title, sub: r.summary, url: r.url, icon: "tool" });
      for (const r of res.filter((x) => x.type !== "tool" && x.type !== "skill").slice(0, 3)) out.push({ group: "Guides", title: r.title, sub: r.summary, url: r.url, icon: "guide" });
    }
    return out.slice(0, 11);
  }, [q, ids, skills, content, tools]);

  const showList = open && sugs.length > 0;
  const Icon = { person: User, skill: Sparkles, tool: Wrench, guide: BookOpen, route: ArrowRight };

  return (
    <Form method="get" action="/search" role="search" className={`searchbox searchbox-${variant}`} onSubmit={(e) => {
      if (active >= 0 && sugs[active]) {
        e.preventDefault();
        navigate(sugs[active].url);
        setOpen(false);
      }
    }}>
      <label htmlFor={`sb-${id}`} className={variant === "hero" ? "searchbox-label" : "sr-only"}>
        {label}
      </label>
      <div className="searchbox-field">
        <Search size={20} aria-hidden="true" className="searchbox-icon" />
        <input
          ref={inputRef}
          id={`sb-${id}`}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`sbl-${id}`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `sbo-${id}-${active}` : undefined}
          autoComplete="off"
          maxLength={120}
          autoFocus={autoFocus}
          placeholder="Search tools, skills, professions"
          value={q}
          onFocus={() => {
            setTouched(true);
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(sugs.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
        {q && (
          <button type="button" className="icon-btn searchbox-clear" aria-label="Clear search" onClick={() => {
            setQ("");
            inputRef.current?.focus();
          }}>
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {variant !== "header" && (
          <button type="submit" className="btn btn-primary searchbox-submit">
            Search
          </button>
        )}
      </div>
      {showList && (
        <ul id={`sbl-${id}`} role="listbox" className="suggestions" aria-label="Suggestions">
          {sugs.map((s, i) => {
            const I = Icon[s.icon];
            const first = i === 0 || sugs[i - 1].group !== s.group;
            return (
              <li
                key={s.url + i}
                id={`sbo-${id}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`option${i === active ? " is-active" : ""}${first && i > 0 ? " option-group-start" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigate(s.url);
                  setOpen(false);
                }}
              >
                <I size={18} aria-hidden="true" className="option-icon" />
                <span>
                  <span className="option-title">
                    {first && <span className="option-group">{s.group} · </span>}
                    {s.title}
                  </span>
                  {s.sub && <span className="option-sub">{s.sub}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Form>
  );
}
