// S24 Not found (any unknown path, including reserved R1.5/R2 routes).
import { data } from "react-router";

export function clientLoader() {
  throw data("Not found", { status: 404 });
}

export default function NotFound() {
  return null;
}
