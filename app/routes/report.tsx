// S18 Report an issue (?page=, ?record=, ?type=). Same form and endpoint as Suggest an edit.
import { useSearchParams } from "react-router";
import type { Route } from "./+types/report";
import { meta as pageMeta } from "../lib/build";
import { SuggestForm, kindFromPath, REASONS } from "../components/SuggestSheet";

export const meta: Route.MetaFunction = () => pageMeta("Report an issue", undefined, { noindex: true });

export default function Report() {
  const [p] = useSearchParams();
  const page = p.get("page") ?? "/";
  const reason = Object.entries(REASONS).find(([, r]) => r.type === p.get("type"))?.[0];
  return (
    <section className="wrap" style={{ paddingTop: 28, maxWidth: 640 }}>
      <span className="t-label">Report an issue</span>
      <h1 className="t-h1" style={{ marginTop: 4 }}>Something wrong or out of date?</h1>
      <p className="mu" style={{ marginTop: 6 }}>Wrong price, broken link, a tool that closed? Tell us and a person will check it.</p>
      <div className="card pad" style={{ marginTop: 18 }}>
        <SuggestForm page={page} kind={kindFromPath(page)} reason={reason} recordId={p.get("record") ?? undefined} />
      </div>
    </section>
  );
}
