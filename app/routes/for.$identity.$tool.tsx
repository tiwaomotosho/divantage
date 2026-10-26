// V2.5 URL kept for early links: /for/{identity}/{tool} → the role learning path /tools/{tool}/for/{identity}.
import { redirect } from "react-router";
import type { Route } from "./+types/for.$identity.$tool";

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  return redirect(`/tools/${params.tool}/for/${params.identity}`);
}

export default function Redirecting() {
  return null;
}
