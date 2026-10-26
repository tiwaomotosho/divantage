// S19 Report confirmation (target of the no-JavaScript form post).
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/report.thanks";
import { meta as pageMeta } from "../lib/build";
import { EmptyState } from "../components/da";

export const meta: Route.MetaFunction = () => pageMeta("Thank you", undefined, { noindex: true });

export default function Thanks() {
  const [p] = useSearchParams();
  const ref = p.get("ref");
  return (
    <EmptyState
      illustration="suggestion-sent"
      title="Thank you"
      body={`${ref ? `Reference ${ref}. ` : ""}A person reviews every suggestion, usually within 7 days.`}
      actions={<Link className="btn p blk" to="/">Go home</Link>}
    />
  );
}
