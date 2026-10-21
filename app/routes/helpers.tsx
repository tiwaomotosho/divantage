// S39 Helpers index.
import { Link, data, useNavigate } from "react-router";
import { FlagOff } from "../components/ui";
import type { Route } from "./+types/helpers";
import { helperCards } from "~/lib/content.server";
import { flag, listedHelpers, meta as pageMeta } from "../lib/build";
import { HelperCard } from "../components/HelperBits";
import { ChipList, PageHeader } from "../components/ui";
import { helperActions, useHelperState } from "../lib/store";
import { helperPosition, useHelperDefs } from "../components/HelperPanel";
import { openSuggest } from "../components/SuggestSheet";

export function loader() {
  return { helpers: helperCards() };
}

export const meta: Route.MetaFunction = () => pageMeta("Helpers: guided paths through the right tools", "A helper walks you through the tools for one kind of work, one step at a time.");

export default function Helpers({ loaderData: d }: Route.ComponentProps) {
  if (!flag("helpers")) return <FlagOff />;
  const state = useHelperState();
  const defs = useHelperDefs(Boolean(state?.active));
  const navigate = useNavigate();
  const active = state?.active;
  const moved = active && !listedHelpers.includes(active);
  const def = defs?.find((h) => h.slug === active);
  const pos = def ? helperPosition(def, state!.progress[def.slug]) : null;
  return (
    <div className="container">
      <PageHeader
        title="Helpers"
        lead="A helper walks you through the tools for one kind of work, one step at a time. It follows you around the site, so you can look things up and come back."
      />
      {moved && (
        <div className="welcome-back" role="status">
          <p>
            This helper has moved. Choose another.{" "}
            <button type="button" className="btn btn-tertiary btn-sm" onClick={() => helperActions.stop()}>
              OK
            </button>
          </p>
        </div>
      )}
      {def && pos && !pos.finished && (
        <div className="welcome-back" role="region" aria-label="Continue">
          <p>
            Continue the {def.title.replace(/^The /, "")}. Stage {pos.stage!.n} of {def.stages.length}.{" "}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
              helperActions.resume();
              navigate(`/helpers/${def.slug}`);
            }}>
              Resume
            </button>{" "}
            <button type="button" className="btn btn-tertiary btn-sm" onClick={() => helperActions.pause()}>
              Not now
            </button>
          </p>
        </div>
      )}
      <ul className="helper-cards helper-cards-index">
        {d.helpers.map((h) => (
          <li key={h.slug}>
            <HelperCard
              h={h}
              actions={
                <div className="helper-card-actions">
                  <button type="button" className="btn btn-ink" aria-label={`Start the ${h.short} helper`} onClick={() => {
                    helperActions.start(h.slug);
                    navigate(`/helpers/${h.slug}`);
                  }}>
                    Start
                  </button>
                  <Link className="btn btn-secondary" to={`/helpers/${h.slug}`} aria-label={`Preview the ${h.short} helper`}>
                    Preview
                  </Link>
                </div>
              }
            />
            <div className="helper-ids">
              <p className="label">Is your work on this list?</p>
              <ChipList items={h.identities.map((i) => ({ to: `/for/${i.slug}`, label: i.label }))} />
            </div>
          </li>
        ))}
      </ul>
      <section className="section">
        <h2>Want a helper for your work?</h2>
        <p>
          <a href="/suggest?type=suggest_helper" onClick={(e) => {
            e.preventDefault();
            openSuggest({ type: "suggest_helper", kind: "helper" });
          }}>
            Tell us what you do and what you'd like help with
          </a>
          .
        </p>
      </section>
    </div>
  );
}
