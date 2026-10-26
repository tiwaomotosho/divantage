// S36 full-page fallback /suggest (always noindex). ?page= and ?type= prefill.
import { useSearchParams } from "react-router";
import type { Route } from "./+types/suggest";
import { meta as pageMeta } from "../lib/build";
import { SuggestForm, kindFromPath, REASONS } from "../components/SuggestSheet";

export const meta: Route.MetaFunction = () => pageMeta("Suggest an edit", undefined, { noindex: true });

export default function Suggest() {
  const [p] = useSearchParams();
  const page = p.get("page") ?? "/";
  const type = p.get("type");
  const reason = Object.entries(REASONS).find(([, r]) => r.type === type)?.[0];
  return (
    <section className="wrap" style={{ paddingTop: 28, maxWidth: 640 }}>
      <span className="t-label">Suggest an edit</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>Help us get it right</h1>
      <p className="mu" style={{ marginTop: 6 }}>A person reviews every suggestion. Nothing changes on the site until they approve it.</p>
      <div className="card pad" style={{ marginTop: 18 }}>
        <SuggestForm page={page} kind={kindFromPath(page)} reason={reason} recordId={p.get("record") ?? undefined} />
      </div>
    </section>
  );
}
