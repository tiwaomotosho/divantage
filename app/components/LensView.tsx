// Lens body shared by S29 (/tools/{tool}/for/{need}) and S28 (/for/{identity}/{tool}).
import { Link } from "react-router";
import type { ModuleView } from "~/lib/lensview";
import type { Level } from "~/lib/types";
import { Callout, IdentityChip, Section, ToolRow, type ToolRowData } from "./ui";
import { LevelTabs } from "./Roadmap";

export interface LensBody {
  tool: { slug: string; name: string };
  roadmap: { slug: string };
  need: { slug: string; label: string; description: string };
  flagship: boolean;
  why: string | null;
  different: string | null;
  starter: string | null;
  pitfalls: string[];
  pairs: ToolRowData[];
  forIdentities: { slug: string; label: string; hue: string }[];
  withNeed: { slug: string; label: string; hue: string }[];
  levels: Record<Level, ModuleView[]>;
}

export function LensView({ d }: { d: LensBody }) {
  return (
    <>
      {d.flagship && d.forIdentities.length > 0 && (
        <div className="header-chips">
          <p className="label">Written for</p>
          <ul className="chip-list">
            {d.forIdentities.map((i) => (
              <li key={i.slug}>
                <IdentityChip {...i} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {d.flagship ? (
        <>
          {d.why && (
            <Section title="Why it matters" id="h-why">
              <p className="reading">{d.why}</p>
            </Section>
          )}
          {d.different && (
            <Callout tone="info" title={`Not the generic ${d.tool.name} course`}>
              <p>{d.different}</p>
            </Callout>
          )}
        </>
      ) : (
        <Section title={d.need.label} id="h-need">
          <p className="reading">{d.need.description}</p>
          {d.withNeed.length > 0 && (
            <>
              <p className="label">Who needs this</p>
              <ul className="chip-list">
                {d.withNeed.map((i) => (
                  <li key={i.slug}>
                    <IdentityChip {...i} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}
      <Section title="Your path" id="h-path" lead="Modules that matter most for this work come first. Tick what you can already do; it's saved only on this device.">
        <LevelTabs levels={d.levels} roadmap={d.roadmap.slug} needLabel={d.need.label} />
      </Section>
      {d.starter && (
        <Section title="Starter project" id="h-starter">
          <p className="reading">{d.starter}</p>
        </Section>
      )}
      {d.pitfalls.length > 0 && (
        <Section title="Pitfalls" id="h-pitfalls">
          <ul className="reading bullets">
            {d.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>
      )}
      {d.pairs.length > 0 && (
        <Section title="Pairs well with" id="h-pairs">
          <ul className="tool-rows">
            {d.pairs.map((t) => (
              <ToolRow key={t.slug} t={t} />
            ))}
          </ul>
        </Section>
      )}
      <p>
        <Link to={`/tools/${d.tool.slug}/roadmap`}>See the full {d.tool.name} course outline</Link>
      </p>
    </>
  );
}
