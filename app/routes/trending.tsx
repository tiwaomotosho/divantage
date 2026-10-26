// S47 Trending (reference 22-trending): market tabs, ranked list with deltas, plus skills, roles and tools (doc 24 §10).
// Demo counts until real opted-in activity exists (owner decision 26 Oct 2026).
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/trending";
import { meta as pageMeta } from "../lib/build";
import { fetchJson } from "../lib/indexes";
import { Icon, Tag, ToolLogo } from "../components/da";
import { shortDate } from "~/lib/view";
import { deviceActions, useDevice } from "../lib/store";

export const meta: Route.MetaFunction = () => pageMeta("What people are working on", "Anonymous weekly counts from people who opted in.");

type Row = { slug: string; label?: string; name?: string; group?: string; count: number; delta: number };
type Market = { goals: Row[]; skills: Row[]; identities: Row[]; tools: Row[] };
export interface TrendingFile {
  demo: boolean;
  week: string;
  people: number;
  markets: Record<"ng" | "africa" | "all", Market>;
}

export const MARKETS = [
  ["ng", "Nigeria"],
  ["africa", "Africa"],
  ["all", "Everywhere"],
] as const;

export function Delta({ d }: { d: number }) {
  return (
    <span className={`tag ${d >= 0 ? "h-green" : "h-coral"}`} style={{ width: 52, justifyContent: "center" }}>
      {d >= 0 ? `+${d}` : `−${Math.abs(d)}`}
    </span>
  );
}

export default function Trending() {
  const dev = useDevice();
  const [data, setData] = useState<TrendingFile | null>(null);
  const [m, setM] = useState<"ng" | "africa" | "all">("ng");
  useEffect(() => {
    fetchJson<TrendingFile>("/data/trending.json").then(setData, () => setData(null));
  }, []);
  useEffect(() => {
    if (dev?.market === "africa") setM("africa");
    else if (dev?.market === "other") setM("all");
  }, [dev?.market]);
  const t = data?.markets[m];
  return (
    <section className="wrap" style={{ paddingTop: 28, maxWidth: 900 }}>
      <span className="t-label">Trending{data ? ` · week of ${shortDate(data.week)}` : ""}</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>
        What people are working on
      </h1>
      <p className="mu" style={{ marginTop: 6 }}>
        Anonymous weekly counts from people who opted in. Shown only when 10 or more people are counted for a row.
      </p>
      {data?.demo && (
        <div className="banner info" style={{ marginTop: 14 }}>
          <Icon name="info" />
          <div className="fl1 t-sm">
            <b>Preview with sample numbers.</b> <span className="mu">These counts are demo data so you can see how this page will work. Real counts start when people opt in.</span>
          </div>
        </div>
      )}
      <div className="seg" style={{ marginTop: 16 }} role="tablist" aria-label="Market">
        {MARKETS.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={m === k}
            onClick={() => {
              setM(k);
              deviceActions.setMarket(k === "all" ? "other" : k);
            }}
          >
            {l}
          </button>
        ))}
      </div>
      {!t && <div className="sk" style={{ height: 300, marginTop: 16 }} />}
      {t && (
        <>
          <div className="card" style={{ marginTop: 16, padding: "4px 20px" }}>
            <div className="list">
              {t.goals.slice(0, 5).map((g, i) => (
                <Link key={g.slug} className="li" to={`/goals/${g.slug}`} style={{ padding: "14px 0" }}>
                  <span className="t-h2" style={{ width: 36, color: i < 3 ? "var(--da-color-primary)" : "var(--da-color-ink-subtle)" }}>
                    {i + 1}
                  </span>
                  <div className="fl1">
                    <div className="b7 t-sm">{g.label}</div>
                    <div className="t-xs su">{g.group}</div>
                  </div>
                  <Delta d={g.delta} />
                </Link>
              ))}
            </div>
          </div>
          <div className="grid c3" style={{ marginTop: 16 }}>
            <div className="card pad">
              <div className="t-label">Skills this week</div>
              <div className="list" style={{ marginTop: 4 }}>
                {t.skills.slice(0, 3).map((s) => (
                  <Link key={s.slug} className="li t-sm" to={`/skills/${s.slug}`}>
                    <span className="fl1 b6">{s.label}</span>
                    <Delta d={s.delta} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="card pad">
              <div className="t-label">Roles this week</div>
              <div className="list" style={{ marginTop: 4 }}>
                {t.identities.slice(0, 3).map((s) => (
                  <Link key={s.slug} className="li t-sm" to={`/for/${s.slug}`}>
                    <span className="fl1 b6">{s.label}</span>
                    <Delta d={s.delta} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="card pad">
              <div className="t-label">Tools this week</div>
              <div className="list" style={{ marginTop: 4 }}>
                {t.tools.slice(0, 3).map((s) => (
                  <Link key={s.slug} className="li t-sm" to={`/tools/${s.slug}`}>
                    <ToolLogo slug={s.slug} size="sm" />
                    <span className="fl1 b6">{s.name}</span>
                    <Delta d={s.delta} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <p className="t-xs su" style={{ marginTop: 12 }}>
            <Tag hue="slate">Guide, not a ranking</Tag> A small group can move these numbers. Treat them as a hint of what's useful now.
          </p>
        </>
      )}
    </section>
  );
}
