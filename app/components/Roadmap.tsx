// LevelTabs / LevelColumns + ModuleCard (06 §11). Ticks are on-device only (da.ticks.v1).
import { useState } from "react";
import { Sprout, TrendingUp, Mountain, Pencil, Check } from "lucide-react";
import type { ModuleView } from "~/lib/lensview";
import { hours, LEVEL_LABEL } from "~/lib/format";
import type { Level } from "~/lib/types";
import { flag } from "../lib/build";
import { tickActions, useHydrated, useTicks } from "../lib/store";

const LEVELS: Level[] = ["beginner", "intermediate", "expert"];
const ICON = { beginner: Sprout, intermediate: TrendingUp, expert: Mountain };

export function LevelTabs({ levels, roadmap, needLabel }: { levels: Record<Level, ModuleView[]>; roadmap: string; needLabel?: string }) {
  const [tab, setTab] = useState<Level>("beginner");
  const ticks = useTicks();
  const hydrated = useHydrated();
  const mine = ticks?.ticks[roadmap] ?? {};
  const all = LEVELS.flatMap((l) => levels[l]);
  const ticked = all.filter((m) => mine[m.slug]).length;
  return (
    <div className="levels">
      {flag("roadmap_ticks") && hydrated && (
        <p className="meta" role="status">
          {ticked} of {all.length} modules ticked on this device
        </p>
      )}
      <div role="tablist" aria-label="Levels" className="level-tabs">
        {LEVELS.map((lv) => {
          const I = ICON[lv];
          return (
            <button key={lv} type="button" role="tab" id={`lt-${lv}`} aria-controls={`lp-${lv}`} aria-selected={tab === lv} className="level-tab" data-level={lv} onClick={() => setTab(lv)}>
              <I size={18} aria-hidden="true" /> {LEVEL_LABEL[lv]}
            </button>
          );
        })}
      </div>
      <div className="level-columns">
        {LEVELS.map((lv) => {
          const mods = levels[lv];
          const core = mods.filter((m) => m.relevance !== "also_useful");
          const extra = mods.filter((m) => m.relevance === "also_useful");
          const total = mods.reduce((a, m) => a + (m.hours ?? 0), 0);
          const I = ICON[lv];
          return (
            <section key={lv} id={`lp-${lv}`} role="tabpanel" aria-labelledby={`lt-${lv}`} className={`level-col${tab === lv ? " is-active" : ""}`} data-level={lv}>
              <header className="level-head">
                <h3>
                  <I size={20} aria-hidden="true" /> {LEVEL_LABEL[lv]}
                </h3>
                <p className="meta">
                  {mods.length} modules{total ? ` · about ${Math.round(total)} h` : ""}
                </p>
              </header>
              <ol className="modules">
                {core.map((m) => (
                  <ModuleCard key={m.slug} m={m} roadmap={roadmap} needLabel={needLabel} done={Boolean(mine[m.slug])} />
                ))}
              </ol>
              {extra.length > 0 && (
                <details className="also-useful">
                  <summary>Also useful ({extra.length})</summary>
                  <ol className="modules">
                    {extra.map((m) => (
                      <ModuleCard key={m.slug} m={m} roadmap={roadmap} done={Boolean(mine[m.slug])} />
                    ))}
                  </ol>
                </details>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ModuleCard({ m, roadmap, needLabel, done }: { m: ModuleView; roadmap: string; needLabel?: string; done: boolean }) {
  const hydrated = useHydrated();
  const id = `m-${roadmap}-${m.slug}`;
  return (
    <li className={`module${done ? " is-done" : ""}${m.signature ? " is-signature" : ""}`}>
      <div className="module-top">
        <h4>{m.title}</h4>
        {m.hours !== null && <span className="badge badge-neutral">{hours(m.hours)}</span>}
      </div>
      {m.specific && needLabel && <span className="badge badge-accent">Specific to {needLabel.toLowerCase()}</span>}
      {m.signature && <span className="badge badge-accent">Tool-specific</span>}
      {m.outcome && <p className="module-outcome">{m.outcome}</p>}
      {m.topics.length > 0 && <p className="meta">{m.topics.join(", ")}</p>}
      {m.practice && (
        <p className="practice">
          <Pencil size={16} aria-hidden="true" /> <span>Practice: {m.practice}</span>
        </p>
      )}
      {flag("roadmap_ticks") && (
        <label className="check module-check" htmlFor={id}>
          <input id={id} type="checkbox" checked={done} disabled={!hydrated} onChange={(e) => tickActions.set(roadmap, m.slug, e.target.checked)} />
          I can do this
          {done && (
            <span className="done-label">
              <Check size={16} aria-hidden="true" /> Done
            </span>
          )}
        </label>
      )}
    </li>
  );
}
