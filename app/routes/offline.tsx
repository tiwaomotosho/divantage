// S25 Offline (reference 25-offline): banner, illustration, saved pages.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/offline";
import { meta as pageMeta } from "../lib/build";
import { EmptyState, Icon } from "../components/da";

export const meta: Route.MetaFunction = () => pageMeta("You're offline", undefined, { noindex: true });

/** Pages kept by the service worker (public/sw.js), newest first. */
async function savedPages(): Promise<string[]> {
  if (typeof caches === "undefined") return [];
  const keys = (await caches.keys()).filter((k) => k.endsWith("-pages"));
  const urls = new Set<string>();
  for (const k of keys) for (const r of await (await caches.open(k)).keys()) {
    const u = new URL(r.url);
    if (!u.pathname.endsWith(".data") && !u.pathname.startsWith("/data/") && !u.pathname.startsWith("/api/") && u.pathname !== "/offline") urls.add(u.pathname);
  }
  return [...urls].reverse().slice(0, 12);
}

export default function Offline() {
  const [pages, setPages] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  useEffect(() => {
    savedPages().then(setPages, () => setPages([]));
  }, []);
  return (
    <>
      <div className="banner" style={{ borderRadius: 0, justifyContent: "center", background: "var(--da-color-warning-soft)" }}>
        <Icon name="wifi-off" /> Offline · showing saved pages
      </div>
      <EmptyState
        illustration="offline"
        title="You're offline"
        body="Pages you opened recently still work. Your ticks are saved on this device."
        actions={
          <>
            <button type="button" className="btn p blk" onClick={() => location.reload()}>
              Try again
            </button>
            <button type="button" className="btn s blk" onClick={() => setShow(!show)} aria-expanded={show}>
              Open saved pages
            </button>
          </>
        }
      />
      {show && (
        <section className="wrap" style={{ maxWidth: 440, marginTop: -24 }}>
          <div className="card" style={{ padding: "4px 20px" }}>
            <div className="list">
              {pages.length === 0 && <div className="li t-sm mu">No saved pages yet. Pages you open while online are kept here.</div>}
              {pages.map((p) => (
                <Link key={p} className="li t-sm" to={p} reloadDocument>
                  <Icon name="bookmark" />
                  <span className="fl1">{p === "/" ? "Home" : p}</span>
                  <Icon name="chevron-right" className="cr" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
