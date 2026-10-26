// S24 Not found (reference 24-not-found) for any unknown path, including reserved R1.5/R2 routes.
import type { Route } from "./+types/not-found";
import { meta as pageMeta } from "../lib/build";
import { NotFoundState } from "../root";

export const meta: Route.MetaFunction = () => pageMeta("Page not found", undefined, { noindex: true });

export default function NotFound() {
  return <NotFoundState />;
}
