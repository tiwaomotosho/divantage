// IdentityPicker (reference 01/02): .input with role chips inside (max 3), ARIA combobox + listbox, example chips.
// Suggestions use .card.el + .list (new composition from da.css, no new styling).
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import type { IdentityHit } from "~/lib/search";
import { loadIdentitySearch, useLazy } from "../lib/indexes";
import { Icon } from "./da";

export interface PickedIdentity {
  slug: string;
  label: string;
}

export function IdentityPicker({
  selected,
  onChange,
  onPick,
  examples,
  max = 3,
  placeholder = "Your job or role, e.g. nurse, accountant, farmer",
  label = "Your job or role",
}: {
  selected: PickedIdentity[];
  onChange?: (next: PickedIdentity[]) => void;
  onPick?: (p: PickedIdentity) => void;
  examples?: PickedIdentity[];
  max?: number;
  placeholder?: string;
  label?: string;
}) {
  const base = `ip${useId().replace(/:/g, "")}`;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [touched, setTouched] = useState(false);
  const [say, setSay] = useState("");
  const [hint, setHint] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const ids = useLazy(loadIdentitySearch, touched);
  const hits: IdentityHit[] = useMemo(
    () => (q.trim().length >= 2 && ids.status === "ready" ? ids.value!(q, 8).filter((h) => !selected.some((s) => s.slug === h.slug)) : []),
    [q, ids, selected],
  );
  useEffect(() => {
    if (q.trim().length >= 2 && ids.status === "ready") setSay(`${hits.length} suggestions`);
  }, [hits.length, q, ids.status]);

  function add(p: PickedIdentity) {
    if (onPick) {
      onPick(p);
      setQ("");
      setOpen(false);
      return;
    }
    if (selected.length >= max) return setHint(`You can choose up to ${max}`);
    onChange?.([...selected, p]);
    setSay(`${p.label} added`);
    setQ("");
    setActive(-1);
    setHint("");
    input.current?.focus();
  }
  function remove(slug: string) {
    onChange?.(selected.filter((s) => s.slug !== slug));
    setHint("");
    input.current?.focus();
  }
  const showList = open && q.trim().length >= 2;
  const noMatch = showList && ids.status === "ready" && hits.length === 0;

  if (ids.status === "error")
    return (
      <Link className="btn s" to="/for">
        Choose from the list
      </Link>
    );

  return (
    <div style={{ position: "relative" }}>
      <div className={`input ${selected.length ? "wrapchips" : ""} ${open ? "focus" : ""}`} data-da="identity-picker">
        {selected.length === 0 && <Icon name="search" />}
        {selected.map((s) => (
          <span key={s.slug} className="chip sel" data-da="identity-chip">
            {s.label}
            <button type="button" aria-label={`Remove ${s.label}`} onClick={() => remove(s.slug)} style={{ display: "inline-flex", minWidth: 24, minHeight: 24, alignItems: "center", justifyContent: "center" }}>
              <Icon name="x" />
            </button>
          </span>
        ))}
        <input
          ref={input}
          id={`${base}-in`}
          role="combobox"
          aria-label={label}
          aria-expanded={showList}
          aria-controls={`${base}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${base}-o${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          maxLength={120}
          placeholder={selected.length ? "Add another role" : placeholder}
          value={q}
          style={{ minWidth: 120 }}
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
              setActive((a) => Math.min(hits.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Enter" && hits.length) {
              e.preventDefault();
              const h = hits[Math.max(0, active)];
              add({ slug: h.slug, label: h.label });
            } else if (e.key === "Escape") setOpen(false);
            else if (e.key === "Backspace" && !q && selected.length) remove(selected[selected.length - 1].slug);
          }}
        />
        {selected.length > 0 && (
          <>
            <span className="fl1" />
            <span className="t-xs su">
              {selected.length} of {max}
            </span>
          </>
        )}
        {selected.length === 0 && <span className="kbd desk">/</span>}
      </div>
      {showList && (
        <div className="card el" style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 6px)", zIndex: 200, padding: "4px 16px", maxHeight: 360, overflow: "auto" }}>
          <ul id={`${base}-list`} role="listbox" aria-label="Suggestions" className="list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {ids.status === "loading" && (
              <li className="li">
                <span className="sk fl1" style={{ height: 16 }} />
              </li>
            )}
            {hits.map((h, i) => (
              <li
                key={h.slug}
                id={`${base}-o${i}`}
                role="option"
                aria-selected={i === active}
                className="li"
                style={{ cursor: "pointer", color: i === active ? "var(--da-color-primary)" : undefined }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add({ slug: h.slug, label: h.label });
                }}
              >
                <Icon name="user" />
                <span className="fl1">
                  <span className="b6">{h.label}</span>
                  <span className="t-xs su" style={{ display: "block" }}>
                    {h.parent ? `Specialism of ${h.parent} · ` : ""}
                    {h.family} › {h.sector}
                  </span>
                </span>
              </li>
            ))}
            {noMatch && (
              <li className="li t-sm">
                <span className="fl1 mu">
                  We don't have "{q}" yet. Try a broader word, or{" "}
                  <Link className="pr b6" to={`/suggest?type=suggest_identity`}>
                    suggest my role
                  </Link>
                  .
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
      {hint && <p className="t-sm" style={{ marginTop: 8, color: "var(--da-color-warning)" }}>{hint}</p>}
      <p className="sr" aria-live="polite">
        {say}
      </p>
      {examples && examples.length > 0 && selected.length === 0 && (
        <div className="row g8 wrapf" style={{ marginTop: 12 }}>
          {examples.map((x) => (
            <button key={x.slug} type="button" className="chip" data-da="identity-example" onClick={() => add(x)}>
              {x.slug === "student" ? "I'm a student" : x.label[0] + x.label.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
