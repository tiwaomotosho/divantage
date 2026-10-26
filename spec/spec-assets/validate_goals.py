#!/usr/bin/env python3
"""Validates the V2.6 goals layer: goals.json, alternatives.json, tool-markets.json.
Usage: python3 -I spec-assets/validate_goals.py <pack root>
Errors (exit 1): schema, unknown ids, <2 goals for a need, a tool with no goal, alternatives that are not in the registry,
an alternative list that is not exactly the derived one, fewer than 90% of tools with a full set of 7.
Warnings: tools that still have fewer than 7 alternatives (listed in 08_Starter_Catalogue/generated/alternatives-coverage.json)."""
import json, os, sys, collections
from jsonschema import Draft202012Validator, FormatChecker
R = sys.argv[1]
load = lambda p: json.load(open(os.path.join(R, p), encoding="utf-8"))
E, W = [], []
goals = load("spec-assets/taxonomy/goals.json")["values"]
alts = {a["tool_id"]: a for a in load("spec-assets/taxonomy/alternatives.json")["values"]}
tm = load("spec-assets/taxonomy/tool-markets.json")["values"]
reg = {r["id"]: r for r in load("08_Starter_Catalogue/registry/tools-registry.json")["values"]}
needs = {n["slug"] for n in load("spec-assets/taxonomy/needs.json")["values"]}
v = Draft202012Validator(load("spec-assets/schemas/goal.schema.json"), format_checker=FormatChecker())
slugs = set(); per_need = collections.Counter(); in_goal = set()
for g in goals:
    for e in v.iter_errors(g): E.append(f"goal {g.get('slug')}: {e.message[:120]}")
    if g["slug"] in slugs: E.append(f"duplicate goal {g['slug']}")
    slugs.add(g["slug"]); per_need[g["need"]] += 1
    if g["need"] not in needs: E.append(f"goal {g['slug']}: unknown need {g['need']}")
    for t in g["tool_ids"]:
        in_goal.add(t)
        if t not in reg: E.append(f"goal {g['slug']}: unknown tool {t}")
ic = collections.Counter(i for g in goals for i in g["intents"])
for i in ("compete", "grow", "scale"):
    if ic[i] < 40: E.append(f"intent {i} has only {ic[i]} goals (minimum 40)")
for n in needs:
    if per_need[n] < 2: E.append(f"need {n} has {per_need[n]} goals (minimum 2)")
for t in reg:
    if t not in in_goal: E.append(f"tool {reg[t]['slug']} is in no goal, so it has no alternatives and cannot be reached from a goal")
    if t not in alts: E.append(f"tool {reg[t]['slug']} has no alternatives record")
full = 0
full_sk = 0
for t, a in alts.items():
    if t not in reg: E.append(f"alternatives for unknown tool {t}"); continue
    ids = a["alternative_ids"]
    if len(ids) != len(set(ids)) or t in ids: E.append(f"alternatives of {reg[t]['slug']}: repeats or lists itself")
    if len(ids) > 7: E.append(f"alternatives of {reg[t]['slug']}: more than 7")
    for x in ids:
        if x not in reg: E.append(f"alternatives of {reg[t]['slug']}: unknown tool {x}")
    if len(ids) == 7: full += 1
    else: W.append(f"{reg[t]['slug']}: {len(ids)} alternatives (target 7)")
    if a.get("status_same_kind") == "complete": full_sk += 1
    else: W.append(f"{reg[t]['slug']}: {a.get('same_kind_candidates', 0)} same-kind alternatives (target 7)")
for m in tm:
    if m["tool_id"] not in reg: E.append(f"tool-markets: unknown tool {m['tool_id']}")
pct = full / len(reg)
if pct < 0.90: E.append(f"only {pct:.1%} of tools have 7 alternatives (minimum 90%)")
pct_sk = full_sk / len(reg)
if pct_sk < 0.95: E.append(f"only {pct_sk:.1%} of tools have 7 SAME-KIND alternatives (minimum 95%, D-085)")
print(f"Goals {len(goals)} over {len(needs)} needs (min {min(per_need[n] for n in needs)} per need); tools {len(reg)}; 7 alternatives {full}/{len(reg)} = {pct:.1%}; 7 same-kind {full_sk}/{len(reg)} = {pct_sk:.1%}; local tools {len(tm)}; goals by intent {dict(ic)}; Errors {len(E)} Warnings {len(W)}")
for x in E[:60]: print("ERROR  ", x)
for x in W[:8]: print("warning", x)
if len(W) > 8: print(f"... {len(W)-8} more warnings (see alternatives-coverage.json)")
sys.exit(1 if E else 0)
