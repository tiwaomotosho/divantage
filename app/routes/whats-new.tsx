// S37 What's new (reference 21-status-whats-new): every change, in the open; "For you" filters to things you
// starred (personal what's new, doc 24 §11); your suggestions link to their status.
import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/whats-new";
import { db } from "~/lib/content.server";
import { meta as pageMeta } from "../lib/build";
import { useDevice, useHydrated, useRetention } from "../lib/store";

export interface Entry {
  date: string;
  kind: "New" | "Updated" | "Checked";
  title: string;
  body: string;
  url?: string;
  credit?: string;
}

export function loader() {
  return { entries: ((db().whatsNew.entries ?? []) as Entry[]).sort((a, b) => b.date.localeCompare(a.date)) };
}
export const meta: Route.MetaFunction = () => pageMeta("What's new", "Every change, in the open.");

const HUE = { New: "green", Updated: "coral", Checked: "blue" } as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ChangeLog({ entries }: { entries: Entry[] }) {
  return (
    <div className="card" style={{ padding: "4px 20px" }}>
      <div className="list">
        {entries.length === 0 && <div className="li t-sm mu">Nothing here yet.</div>}
        {entries.map((e) => {
          const [, m, day] = e.date.split("-").map(Number);
          return (
            <div key={e.date + e.title} className="row g12 as" style={{ padding: "14px 0" }}>
              <span className="t-mono t-xs su" style={{ width: 52, marginTop: 3 }}>
                {day} {MONTHS[m - 1]}
              </span>
              <span className={`tag h-${HUE[e.kind]}`} style={{ width: 76, justifyContent: "center" }}>
                {e.kind}
              </span>
              <div className="fl1">
                <div className="b7 t-sm">{e.url ? <Link to={e.url}>{e.title}</Link> : e.title}</div>
                <div className="t-sm mu">
                  {e.body}
                  {e.credit ? ` Thanks to ${e.credit}.` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WhatsNew({ loaderData: d }: Route.ComponentProps) {
  const hydrated = useHydrated();
  const dev = useDevice();
  const ret = useRetention();
  const [mine, setMine] = useState(false);
  const starred = new Set(Object.values(dev?.stars ?? {}).map((s) => `/${s.type === "tool" ? "tools" : s.type === "goal" ? "goals" : s.type === "kit" ? "kits" : "helpers"}/${s.slug}`));
  const list = mine ? d.entries.filter((e) => e.url && starred.has(e.url)) : d.entries;
  return (
    <section className="wrap rail" style={{ paddingTop: 28 }}>
      <div className="col g16">
        <div>
          <span className="t-label">What's new</span>
          <h1 className="t-h1" style={{ marginTop: 4 }}>
            Every change, in the open
          </h1>
        </div>
        <div className="seg" role="tablist" aria-label="Show">
          <button type="button" role="tab" aria-selected={!mine} onClick={() => setMine(false)}>
            Everything
          </button>
          <button type="button" role="tab" aria-selected={mine} onClick={() => setMine(true)}>
            For things I starred
          </button>
        </div>
        <ChangeLog entries={list} />
        {mine && hydrated && list.length === 0 && <p className="t-sm mu">No changes yet to the tools, goals and kits you starred.</p>}
      </div>
      <aside className="col g12">
        <span className="t-label">Your suggestions</span>
        <div className="card pad">
          {hydrated && ret && ret.suggestions.length > 0 ? (
            <div className="list">
              {ret.suggestions.map((s) => (
                <Link key={s.ref} className="li t-sm" to={`/suggestions/${s.ref}`}>
                  <span className="t-mono b6">{s.ref}</span>
                  <span className="fl1 su">{s.on}</span>
                </Link>
              ))}
            </div>
          ) : (
            <>
              <div className="b7 t-sm">See something wrong?</div>
              <div className="t-sm mu" style={{ marginTop: 4 }}>
                Every page has "Suggest an edit". You get a reference number and can follow its status here.
              </div>
            </>
          )}
          <Link className="btn s sm" style={{ marginTop: 12 }} to="/suggest">
            Suggest an edit
          </Link>
        </div>
      </aside>
    </section>
  );
}
