// S48 Suggestion status (reference 21-status-whats-new): public change log + "Your suggestion" timeline.
// Review status is demo data until the review queue is connected (owner decision 26 Oct 2026).
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/suggestions.$ref";
import { meta as pageMeta } from "../lib/build";
import { fetchJson } from "../lib/indexes";
import { Icon } from "../components/da";
import { useRetention } from "../lib/store";
import { ChangeLog, type Entry } from "./whats-new";

export const meta: Route.MetaFunction = ({ params }) => pageMeta(`Suggestion ${params.ref}`, undefined, { noindex: true });

const STEPS = [
  ["Received", "We have your suggestion."],
  ["In review", "A reviewer is checking it against the source."],
  ["Decision", "Accepted, changed or declined, with a reason."],
  ["Published", "Appears in What's new."],
];

/** Demo status: a stable stage per reference, so the page looks like the real thing without a backend. */
function demoStage(ref: string) {
  let h = 0;
  for (const c of ref) h = (h * 31 + c.charCodeAt(0)) | 0;
  return 1 + (Math.abs(h) % 3);
}

export default function SuggestionStatus({ params }: Route.ComponentProps) {
  const ret = useRetention();
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    fetchJson<Entry[]>("/data/whats-new.json").then(setEntries, () => setEntries([]));
  }, []);
  const mine = ret?.suggestions.find((s) => s.ref === params.ref);
  const stage = demoStage(params.ref);
  const m = params.ref.match(/DA-(\d{4})(\d{2})(\d{2})/);
  const sent = mine?.at ?? (m ? `${m[1]}-${m[2]}-${m[3]}T09:12:00Z` : null);
  return (
    <section className="wrap rail" style={{ paddingTop: 28 }}>
      <div className="col g16">
        <div>
          <span className="t-label">What's new</span>
          <h1 className="t-h1" style={{ marginTop: 4 }}>
            Every change, in the open
          </h1>
        </div>
        <ChangeLog entries={entries} />
      </div>
      <aside>
        <span className="t-label">Your suggestion</span>
        <h2 className="t-h2 t-mono" style={{ marginTop: 6, fontSize: "1.5rem" }}>
          {params.ref}
        </h2>
        <div className="t-sm mu">{mine ? `${mine.on} · ${mine.type.replace(/_/g, " ")}` : "Suggestion"}</div>
        <div className="card pad" style={{ marginTop: 14 }}>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {STEPS.map(([t, s], i) => (
              <li key={t} className={`step ${i < stage ? "done" : i === stage ? "now" : ""}`}>
                <span className="n">{i < stage && <Icon name="check" />}</span>
                <div>
                  <div className="b7 t-sm ttl" style={{ textDecoration: "none", color: "var(--da-color-ink)" }}>
                    {t}
                  </div>
                  <div className="t-xs su">{i === 0 && sent ? new Date(sent).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : s}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="t-xs su" style={{ marginTop: 8 }}>
          Most suggestions are reviewed within 7 days. Preview: this status is sample data until the review queue is connected.
        </div>
        <Link className="t-sm pr b6" style={{ marginTop: 8, display: "inline-flex", minHeight: 44, alignItems: "center" }} to="/whats-new">
          All changes →
        </Link>
      </aside>
    </section>
  );
}
