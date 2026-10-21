// Formatting helpers (British English, D-036). Framework-free.

const PLURAL_OVERRIDES: Record<string, string> = {
  person: "people",
  child: "children",
  woman: "women",
  man: "men",
  staff: "staff",
  police: "police",
  clergy: "clergy",
  "chief executive": "chief executives",
  "attorney general": "attorneys general",
  "bus driver": "bus drivers",
  "fish": "fish",
  "series": "series",
};

function pluralWord(w: string): string {
  const lower = w.toLowerCase();
  if (PLURAL_OVERRIDES[lower]) return matchCase(w, PLURAL_OVERRIDES[lower]);
  if (/(wo)?man$/i.test(w) && !/(human|german|shaman|ottoman|talisman)$/i.test(w)) return w.replace(/man$/i, (m) => (m === "Man" ? "Men" : "men"));
  if (/person$/i.test(w)) return w.replace(/person$/i, "people");
  if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/i.test(w)) return w + "es";
  if (/(staff|personnel|crew|police|clergy|faithful)$/i.test(w)) return w;
  return w + "s";
}

function matchCase(src: string, out: string) {
  return src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out;
}

/** "Medical Doctor" → "medical doctors"; "Obstetrician and Gynaecologist" → "obstetricians and gynaecologists". */
export function plural(label: string, opts: { lower?: boolean } = {}): string {
  const lower = opts.lower ?? true;
  let base = label;
  let suffix = "";
  const paren = label.match(/^(.*?)(\s*\(.*\))$/);
  if (paren) [base, suffix] = [paren[1], paren[2]];
  const parts = base.split(/(\s+(?:and|or|&)\s+|\s*\/\s*)/);
  const out = parts
    .map((p, i) => {
      if (i % 2 === 1) return p;
      // Pluralise the head noun (last word) unless the phrase has "of" (e.g. "Head of Department").
      const of = p.match(/^(.*?)(\s+(?:of|in|for|at)\s+.*)$/i);
      if (of) return pluralPhrase(of[1]) + of[2];
      return pluralPhrase(p);
    })
    .join("");
  const res = out + suffix;
  return lower ? lowerFirstUnlessAcronym(res) : res;
}

function pluralPhrase(p: string) {
  const words = p.split(" ");
  words[words.length - 1] = pluralWord(words[words.length - 1]);
  return words.join(" ");
}

function lowerFirstUnlessAcronym(s: string) {
  return s
    .split(" ")
    .map((w) => (/^[A-Z][a-z]/.test(w) ? w[0].toLowerCase() + w.slice(1) : w))
    .join(" ");
}

export function lowerFirst(s: string) {
  return s ? s[0].toLowerCase() + s.slice(1) : s;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-21" → "21 Oct 2026". */
export function formatDate(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m) return iso;
  return d ? `${d} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`;
}

/** "2026-10-21" → "Oct 2026". */
export function formatMonth(iso?: string): string {
  if (!iso) return "";
  const [y, m] = iso.slice(0, 10).split("-").map(Number);
  return m ? `${MONTHS[m - 1]} ${y}` : iso;
}

export function hours(h: number): string {
  if (h < 1) return `≈ ${Math.round(h * 60)} min`;
  return `≈ ${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

export const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", expert: "Expert" } as const;

export function pluralise(n: number, one: string, many = one + "s") {
  return `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;
}
