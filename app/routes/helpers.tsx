// S39 Helpers index. New composition from the kit-feature card (09-kits); needs design review.
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/helpers";
import { helperCards } from "~/lib/content.server";
import { flag, meta as pageMeta } from "../lib/build";
import { FlagOff, Icon, Picture, Tag } from "../components/da";
import { deviceActions, helperActions } from "../lib/store";
import { openSuggest } from "../components/SuggestSheet";

export const loader = () => ({ helpers: helperCards() });
export const meta: Route.MetaFunction = () => pageMeta("Helpers: guided paths through the right tools", "A helper walks you through the tools for one kind of work, one step at a time.");

export default function Helpers({ loaderData: d }: Route.ComponentProps) {
  if (!flag("helpers")) return <FlagOff />;
  const navigate = useNavigate();
  return (
    <section className="wrap" style={{ paddingTop: 28 }}>
      <span className="t-label">Helpers</span>
      <h1 className="t-h1" style={{ marginTop: 6 }}>
        Step-by-step guides for your kind of work
      </h1>
      <p className="t-lg mu" style={{ marginTop: 6 }}>
        A helper walks you through the tools for one kind of work, one step at a time. It stays at the bottom of the screen while you look things up.
      </p>
      <div className="banner info" style={{ marginTop: 18 }} data-da="helper-explainer">
        <Icon name="route" />
        <div className="fl1 t-sm">
          <b>What is a helper?</b> A step-by-step guide for your kind of work. It stays at the bottom of the screen while you open tools, so you never lose your place.
        </div>
      </div>
      <div className="grid c3" style={{ marginTop: 20 }}>
        {d.helpers.map((h) => (
          <article key={h.slug} className="card el" style={{ overflow: "hidden", display: "grid", gridTemplateColumns: "1fr" }} data-da="helper-card">
            <div style={{ aspectRatio: "16/9" }}>
              <Picture slug={h.photo} ratio="wide" className="" sizes="(min-width:1024px) 33vw, 100vw" />
            </div>
            <div className="pad" style={{ padding: 22 }}>
              <Tag hue="violet" icon={h.icon}>
                Helper · {h.short}
              </Tag>
              <h2 className="t-h3" style={{ marginTop: 10 }}>
                <Link to={`/helpers/${h.slug}`}>{h.promise}</Link>
              </h2>
              <p className="t-sm mu" style={{ marginTop: 6 }}>
                {h.stages} stages · {h.tools} tools
              </p>
              <div className="row g8" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="btn s sm"
                  aria-label={`Start the ${h.short} helper`}
                  onClick={() => {
                    helperActions.start(h.slug);
                    deviceActions.hideHelper(false);
                    navigate(`/helpers/${h.slug}`);
                  }}
                >
                  Start <Icon name="arrow-right" />
                </button>
                <Link className="btn g sm" to={`/helpers/${h.slug}`} aria-label={`Preview the ${h.short} helper`}>
                  Preview
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="card pad row g16 wrapf" style={{ marginTop: 20 }}>
        <span className="tile h-violet" aria-hidden="true">
          <Icon name="plus" />
        </span>
        <div className="fl1">
          <div className="b7">Want a helper for your work?</div>
          <div className="t-sm mu">Tell us what you do and what you'd like help with.</div>
        </div>
        <button type="button" className="btn s" onClick={() => openSuggest({ reason: "helper" })}>
          Suggest a helper
        </button>
      </div>
    </section>
  );
}
