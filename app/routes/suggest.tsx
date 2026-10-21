// S36 full-page fallback /suggest (always noindex). ?page= and ?type= prefill.
import { useSearchParams } from "react-router";
import type { Route } from "./+types/suggest";
import { meta as pageMeta } from "../lib/build";
import { PageHeader } from "../components/ui";
import { SuggestForm, kindFromPath } from "../components/SuggestSheet";

export const meta: Route.MetaFunction = () => pageMeta("Suggest an edit", undefined, { noindex: true });

export default function Suggest() {
  const [p] = useSearchParams();
  const page = p.get("page") ?? "/";
  return (
    <div className="container narrow">
      <PageHeader title="Suggest an edit" lead="A person reviews every suggestion. Nothing changes on the site until they approve it." />
      <SuggestForm page={page} kind={kindFromPath(page)} initialType={p.get("type") ?? undefined} recordId={p.get("record") ?? undefined} />
    </div>
  );
}
