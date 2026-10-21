// S19 Report confirmation (target of the no-JS form post).
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/report.thanks";
import { meta as pageMeta } from "../lib/build";
import { Callout, PageHeader } from "../components/ui";

export const meta: Route.MetaFunction = () => pageMeta("Thank you", undefined, { noindex: true });

export default function Thanks() {
  const [p] = useSearchParams();
  const ref = p.get("ref");
  return (
    <div className="container narrow">
      <PageHeader title="Thank you" />
      <Callout tone="success">
        <p>{ref ? `Reference ${ref}. ` : ""}A person reviews every suggestion, usually within a week.</p>
      </Callout>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </div>
  );
}
