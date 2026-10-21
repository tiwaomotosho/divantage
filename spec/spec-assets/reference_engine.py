#!/usr/bin/env python3
"""Reference implementation of the identity-first engine (18 §4 and §7). Port to TypeScript in src/lib/identity.ts.

Usage:
  python3 -I reference_engine.py <pack-root> toolkit <identity-slug>
  python3 -I reference_engine.py <pack-root> lens <identity-slug> <tool-slug>
  python3 -I reference_engine.py <pack-root> who-uses <tool-slug>
"""
import json, os, sys, glob, collections

def load(p): return json.load(open(p, encoding="utf-8"))

class Engine:
    def __init__(self, root):
        T = os.path.join(root, "spec-assets/taxonomy"); C = os.path.join(root, "08_Starter_Catalogue")
        self.ids = {i["slug"]: i for i in load(os.path.join(T, "identities/identities.json"))["values"]}
        self.fams = {f["slug"]: f for f in load(os.path.join(T, "identities/families.json"))["values"]}
        self.secs = {s["slug"]: s for s in load(os.path.join(T, "identities/sectors.json"))["values"]}
        nd = load(os.path.join(T, "needs.json"))
        self.needs = {n["slug"]: n for n in nd["values"]}
        self.universal = nd["universal"]
        self.reg = {r["id"]: r for r in load(os.path.join(C, "registry/tools-registry.json"))["values"]}
        self.roadmaps = {r["slug"]: r for r in map(load, glob.glob(os.path.join(C, "records/roadmaps/*.json")))}
        self.lenses = {(l["roadmap"], l["need"]): l for l in map(load, glob.glob(os.path.join(C, "records/lenses/*.json")))}

    def resolve(self, slug):
        """Core (own + parent + family) → sector → universal, de-duplicated, order preserved."""
        i = self.ids[slug]
        own = i["needs"] + (self.ids[i["parent"]]["needs"] if i["parent"] else [])
        core = list(dict.fromkeys(own + self.fams[i["family"]]["needs"]))
        sector = [n for n in self.secs[i["sector"]]["needs"] if n not in core]
        uni = [n for n in self.universal if n not in core and n not in sector]
        return {"core": core, "sector": sector, "universal": uni}

    def roadmap_for_tool(self, tool_id):
        return next((r for r in self.roadmaps.values() if tool_id in r["tool_ids"]), None)

    def auto_title(self, rm, need_slug):
        """Auto-lens title (04 S29): needs are action phrases, so 'Using {tool} to {need}'."""
        name = rm["title"].removesuffix(" skill roadmap")
        lab = self.needs[need_slug]["label"]
        return f"Using {name} to {lab[0].lower() + lab[1:]}"

    def compose(self, roadmap_slug, need_slug):
        """Lens path: flagship priority modules, then need-tagged modules (core); the rest are 'also useful'."""
        rm = self.roadmaps[roadmap_slug]; fl = self.lenses.get((roadmap_slug, need_slug))
        mods = [m for lv in ("beginner", "intermediate", "expert") for m in rm["levels"][lv]]
        order = list(dict.fromkeys((fl["priority_modules"] if fl else []) + [m["slug"] for m in mods if need_slug in m["need_tags"]]))
        path = {lv: [] for lv in ("beginner", "intermediate", "expert")}
        if fl:
            for x in fl["extra_modules"]:
                path[x["level"]].append({"title": x["title"], "relevance": "core", "specific": True})
        for m in sorted(mods, key=lambda m: order.index(m["slug"]) if m["slug"] in order else 999):
            path[m["level"]].append({"title": m["title"], "relevance": "core" if m["slug"] in order else "also_useful"})
        return {"flagship": bool(fl), "title": fl["title"] if fl else self.auto_title(rm, need_slug), "path": path,
                "tailored": bool(order)}

    def pick_lens(self, identity, tool_slug):
        """18 §7: first resolved need using the tool that has a flagship lens; else first need using the tool."""
        tid = "tool_" + tool_slug.replace("-", "_"); rm = self.roadmap_for_tool(tid)
        r = self.resolve(identity); order = r["core"] + r["sector"] + r["universal"]
        cands = [n for n in order if tid in self.needs[n]["tool_ids"]]
        if not rm or not cands:
            return {"need": None, "note": "Tool not part of this identity's toolkit; show full roadmap + better-fit tools.", "others": []}
        best = next((n for n in cands if (rm["slug"], n) in self.lenses), cands[0])
        return {"need": best, "lens": self.compose(rm["slug"], best), "others": [n for n in cands if n != best]}

    def who_uses(self, tool_slug):
        tid = "tool_" + tool_slug.replace("-", "_")
        ns = {n for n, v in self.needs.items() if tid in v["tool_ids"] and not v["universal"]}
        out = collections.defaultdict(list)
        for s in self.ids:
            r = self.resolve(s)
            if ns & set(r["core"] + r["sector"]):
                out[self.secs[self.ids[s]["sector"]]["label"]].append(self.ids[s]["label"])
        return dict(sorted(out.items(), key=lambda kv: -len(kv[1])))

if __name__ == "__main__":
    e = Engine(sys.argv[1]); cmd = sys.argv[2]
    if cmd == "toolkit":
        r = e.resolve(sys.argv[3])
        for grp, label in (("core", "Core to your work"), ("sector", "Shared across your sector"), ("universal", "Everyone benefits")):
            print(f"\n{label}:")
            for n in r[grp][:12]:
                tools = [e.reg[t]["name"] for t in e.needs[n]["tool_ids"][:3]]
                print(f"  - {e.needs[n]['label']}: {', '.join(tools)}")
    elif cmd == "lens":
        res = e.pick_lens(sys.argv[3], sys.argv[4]); print(json.dumps(res, indent=1)[:3000])
    elif cmd == "who-uses":
        for sec, people in e.who_uses(sys.argv[3]).items():
            print(f"{sec} ({len(people)}): {', '.join(people[:8])}{' …' if len(people) > 8 else ''}")
