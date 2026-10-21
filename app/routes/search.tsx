// S02 Search results (query and type filter in the URL; noindex). Client-side over the build-time index.
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { User } from "lucide-react";
import type { Route } from "./+types/search";
import { meta as pageMeta } from "../lib/build";
import { loadContentSearch, loadIdentitySearch, useLazy } from "../lib/indexes";
import { PageHeader } from "../components/ui";
import { SearchBox } from "../components/SearchBox";

export const meta: Route.MetaFunction = () => pageMeta("Search", undefined, { noindex: true });

const TYPES = [
  { id: "", label: "All" },
  { id: "tool", label: "Tools" },
  { id: "task", label: "How-tos" },
  { id: "need", label: "Needs" },
  { id: "skill", label: "Skills" },
  { id: "helper", label: "Helpers" },
  { id: "playbook", label: "Playbooks" },
];
const TYPE_LABEL: Record<string, string> = { tool: "Tool", task: "How-to", need: "Need", skill: "Skill", helper: "Helper", playbook: "Playbook", resource: "Learning resource", comparison: "Comparison" };

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const content = useLazy(loadContentSearch, true);
  const ids = useLazy(loadIdentitySearch, Boolean(q));
  const res = useMemo(() => (content.status === "ready" && q ? content.value!(q) : null), [content, q]);
  const people = useMemo(() => (ids.status === "ready" && q ? ids.value!(q, 3) : []), [ids, q]);
  const list = res ? res.results.filter((r) => !type || r.type === type).slice(0, 40) : [];
  return (
    <div className="container">
      <PageHeader title={q ? `Results for "${q}"` : "Search"} />
      <SearchBox variant="page" defaultValue={q} label="Search tools, skills and professions" />
      {q && (
        <div className="filter-chips" role="group" aria-label="Type">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="chip"
              aria-pressed={type === t.id}
              onClick={() => {
                const p = new URLSearchParams(params);
                if (t.id) p.set("type", t.id);
                else p.delete("type");
                setParams(p, { replace: true });
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {content.status === "error" && (
        <div className="empty-state">
          <h2>Search isn't working right now</h2>
          <p>
            You can still <Link to="/who-are-you">browse everyone</Link> or <Link to="/tools">all tools A–Z</Link>.
          </p>
          <button className="btn btn-secondary" type="button" onClick={() => location.reload()}>
            Try again
          </button>
        </div>
      )}
      {q && content.status === "loading" && <div className="skeleton-list" aria-busy="true" aria-label="Loading results" />}
      {people.length > 0 && !type && (
        <section className="section-tight" aria-label="People">
          <ul className="chip-list">
            {people.map((p) => (
              <li key={p.slug}>
                <Link className="chip chip-person" to={`/for/${p.slug}`}>
                  <User size={16} aria-hidden="true" /> You are a… {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {res && (
        <>
          {res.andEmpty && list.length > 0 && <p className="meta">Showing results that match some of your words.</p>}
          <p className="meta" role="status">
            {list.length} {list.length === 1 ? "result" : "results"}
          </p>
          {list.length === 0 ? (
            <div className="empty-state">
              <h2>No results for "{q}"</h2>
              <p>Try a broader word, check the spelling, or start from who you are.</p>
              <div className="form-actions">
                <Link className="btn btn-primary" to="/">
                  Who are you?
                </Link>
                <Link className="btn btn-secondary" to={`/suggest?type=suggest_tool`}>
                  Suggest a tool we're missing
                </Link>
              </div>
            </div>
          ) : (
            <ol className="results">
              {list.map((r) => (
                <li key={r.id} className="result">
                  <p className="label">{TYPE_LABEL[r.type] ?? r.type}</p>
                  <h2 className="h3">
                    <Link to={r.url}>{r.title}</Link>
                  </h2>
                  {r.summary && <p className="meta">{r.summary}</p>}
                  {r.starts && <span className="badge badge-starts">Can start without paying</span>}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
