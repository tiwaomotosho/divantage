// S18 / S18-R Report an issue (?page=, ?record=, ?type=). Shares the S36 form and endpoint.
import { useSearchParams } from "react-router";
import type { Route } from "./+types/report";
import { meta as pageMeta } from "../lib/build";
import { PageHeader } from "../components/ui";
import { SuggestForm, kindFromPath } from "../components/SuggestSheet";

export const meta: Route.MetaFunction = () => pageMeta("Report an issue", undefined, { noindex: true });

export default function Report() {
  const [p] = useSearchParams();
  const page = p.get("page") ?? "/";
  return (
    <div className="container narrow">
      <PageHeader title="Report an issue" lead="Wrong price, broken link, something out of date? Tell us and a person will check it." />
      <SuggestForm page={page} kind={kindFromPath(page)} initialType={p.get("type") ?? "other"} recordId={p.get("record") ?? undefined} />
    </div>
  );
}
