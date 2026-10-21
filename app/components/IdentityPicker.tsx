// IdentityPicker (06 §11, 04 S01-R): ARIA combobox + listbox, multi-select up to 3, with a Skills cross-group (S01-R2).
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { X, User, Sparkles } from "lucide-react";
import type { IdentityHit } from "~/lib/search";
import { loadIdentitySearch, loadSkillSearch, useLazy } from "../lib/indexes";

export interface PickedIdentity {
  slug: string;
  label: string;
}

interface Props {
  label: string;
  selected?: PickedIdentity[];
  onChange?: (next: PickedIdentity[]) => void;
  /** Single-select mode: called once with the chosen identity (lens switcher, tailor bars). */
  onPick?: (p: PickedIdentity) => void;
  max?: number;
  examples?: PickedIdentity[];
  showSkills?: boolean;
  hideLabel?: boolean;
  placeholder?: string;
  id?: string;
}

type Option = { kind: "identity"; hit: IdentityHit } | { kind: "skill"; slug: string; label: string; desc: string };

export function IdentityPicker({ label, selected = [], onChange, onPick, max = 3, examples, showSkills, hideLabel, placeholder, id }: Props) {
  const autoId = useId();
  const base = id ?? `ip${autoId.replace(/:/g, "")}`;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [touched, setTouched] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [hint, setHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const ids = useLazy(loadIdentitySearch, touched);
  const skills = useLazy(loadSkillSearch, touched && Boolean(showSkills));

  const options: Option[] = useMemo(() => {
    if (q.trim().length < 2 || ids.status !== "ready") return [];
    const hits = ids.value!(q, 8).filter((h) => !selected.some((s) => s.slug === h.slug));
    const out: Option[] = hits.map((hit) => ({ kind: "identity", hit }));
    if (showSkills && skills.status === "ready") for (const s of skills.value!(q, 2)) out.push({ kind: "skill", ...s });
    return out;
  }, [q, ids, skills, selected, showSkills]);

  useEffect(() => {
    if (q.trim().length >= 2 && ids.status === "ready") setAnnounce(`${options.length} suggestions`);
  }, [options.length, q, ids.status]);

  function choose(o: Option) {
    if (o.kind === "skill") {
      navigate(`/skills/${o.slug}`);
      return;
    }
    const p = { slug: o.hit.slug, label: o.hit.label };
    if (onPick) {
      onPick(p);
      setQ("");
      setOpen(false);
      return;
    }
    if (selected.length >= max) {
      setHint(`You can choose up to ${max}`);
      return;
    }
    onChange?.([...selected, p]);
    setAnnounce(`${p.label} added`);
    setQ("");
    setActive(-1);
    setHint("");
    inputRef.current?.focus();
  }

  function remove(slug: string) {
    const r = selected.find((s) => s.slug === slug);
    onChange?.(selected.filter((s) => s.slug !== slug));
    setHint("");
    if (r) setAnnounce(`${r.label} removed`);
    inputRef.current?.focus();
  }

  const listId = `${base}-list`;
  const showList = open && q.trim().length >= 2;
  const noMatch = showList && ids.status === "ready" && options.filter((o) => o.kind === "identity").length === 0;

  if (ids.status === "error") {
    return (
      <div className="picker">
        <p className={hideLabel ? "sr-only" : "picker-label"}>{label}</p>
        <Link className="btn btn-secondary" to="/who-are-you">
          Choose from the list
        </Link>
      </div>
    );
  }

  return (
    <div className="picker">
      <label htmlFor={`${base}-input`} className={hideLabel ? "sr-only" : "picker-label"}>
        {label}
      </label>
      {selected.length > 0 && (
        <ul className="picked" aria-label="Chosen">
          {selected.map((s) => (
            <li key={s.slug} className="picked-chip">
              {s.label}
              <button type="button" onClick={() => remove(s.slug)} aria-label={`Remove ${s.label}`}>
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="picker-box">
        <input
          ref={inputRef}
          id={`${base}-input`}
          className="picker-input"
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${base}-opt-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          maxLength={120}
          placeholder={placeholder ?? "Type your work or role, e.g. nurse, farmer, DJ"}
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
              setOpen(true);
              setActive((a) => Math.min(options.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Enter") {
              if (active >= 0 && options[active]) {
                e.preventDefault();
                choose(options[active]);
              } else if (options[0]) {
                e.preventDefault();
                choose(options[0]);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            } else if (e.key === "Backspace" && !q && selected.length) {
              remove(selected[selected.length - 1].slug);
            }
          }}
        />
        {showList && (
          <ul id={listId} role="listbox" className="suggestions" aria-label="Suggestions" aria-multiselectable={!onPick}>
            {ids.status === "loading" &&
              [0, 1, 2].map((i) => (
                <li key={i} className="skeleton-row" aria-hidden="true" />
              ))}
            {options.map((o, i) => {
              const first = o.kind === "skill" && options[i - 1]?.kind !== "skill";
              return (
                <li
                  key={o.kind === "identity" ? o.hit.slug : `skill-${o.slug}`}
                  id={`${base}-opt-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`option${i === active ? " is-active" : ""}${first ? " option-group-start" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(o);
                  }}
                >
                  {o.kind === "identity" ? (
                    <>
                      <User size={18} aria-hidden="true" className="option-icon" />
                      <span>
                        <span className="option-title">{o.hit.label}</span>
                        <span className="option-sub">
                          {o.hit.parent ? `Specialism of ${o.hit.parent} · ` : ""}
                          {o.hit.family} › {o.hit.sector}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} aria-hidden="true" className="option-icon" />
                      <span>
                        <span className="option-title">
                          <span className="option-group">Skill · </span>
                          {o.label}
                        </span>
                        <span className="option-sub">{o.desc}</span>
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {hint && <p className="hint hint-strong">{hint}</p>}
      {noMatch && (
        <p className="hint">
          We don't have "{q}" yet. Try a broader word (e.g. "engineer"), <Link to="/who-are-you">browse everyone</Link>, or{" "}
          <Link to={`/suggest?type=suggest_identity&text=${encodeURIComponent(q)}`}>tell us</Link>.
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      {examples && examples.length > 0 && (
        <ul className="chip-list example-chips" aria-label="Examples">
          {examples.map((x) => (
            <li key={x.slug}>
              {onChange ? (
                <button
                  type="button"
                  className="chip"
                  aria-pressed={selected.some((s) => s.slug === x.slug)}
                  onClick={() => {
                    if (selected.some((s) => s.slug === x.slug)) return remove(x.slug);
                    if (selected.length >= max) return setHint(`You can choose up to ${max}`);
                    onChange([...selected, x]);
                    setAnnounce(`${x.label} added`);
                  }}
                >
                  <User size={16} aria-hidden="true" /> {x.label}
                </button>
              ) : (
                <Link className="chip" to={`/for/${x.slug}`}>
                  <User size={16} aria-hidden="true" /> {x.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
