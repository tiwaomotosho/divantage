// View-model types and pure rules shared by build-time loaders and the browser (V2.8, doc 28 and doc 31).

export type Hue = "violet" | "teal" | "coral" | "amber" | "blue" | "green" | "pink" | "slate";

/** TrustLine (D-093): a price chip is never shown without a verification chip. */
export interface Trust {
  price: string;
  hue: Hue;
  /** "Checked {date}" only when the price itself was checked on a dated source (FR-096). */
  checked: string | null;
  /** What was partly checked, if anything ("existence and purpose", date). */
  partly: string | null;
  unchecked: string[];
  note: string;
}

/** DepthLabel (D-094, doc 31 §4). */
export interface Depth {
  kind: "role" | "deep" | "general";
  label: string;
}

export interface ToolMention {
  slug: string;
  name: string;
  trust: Trust;
  desc?: string;
  depth?: Depth;
  /** "Learn {tool}" target: the job-specific path if one exists, else the general guide (FR-110). */
  learn: string;
  url?: string | null;
  /** Markets where the tool is not available (D-074), e.g. ["ng"]. */
  notIn?: string[];
}

export interface TileVisual {
  icon: string;
  hue: Hue;
}

export const PRICE: Record<string, { label: string; hue: Hue }> = {
  free: { label: "Free", hue: "green" },
  freemium: { label: "Free plan + paid", hue: "teal" },
  free_trial: { label: "Free trial", hue: "amber" },
  paid_subscription: { label: "Subscription", hue: "violet" },
  paid_once: { label: "One-time price", hue: "violet" },
  open_source: { label: "Open source", hue: "green" },
  usage_based: { label: "Pay per use", hue: "blue" },
  enterprise_quote: { label: "Quote on request", hue: "slate" },
  mixed: { label: "Several options", hue: "slate" },
  unknown: { label: "Price not confirmed", hue: "slate" },
};

export const MARKET_LABEL: Record<string, string> = { ng: "Nigeria", africa: "Africa", all: "Everywhere" };

export function depthLabel(kind: Depth["kind"], who?: string): Depth {
  if (kind === "role") return { kind, label: who ? `For ${who}` : "For your job" };
  if (kind === "deep") return { kind, label: "In depth" };
  return { kind, label: "General guide" };
}

export function depthFromAuthoring(authoring: string | undefined): Depth {
  return !authoring || authoring === "handwritten" ? depthLabel("deep") : depthLabel("general");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
