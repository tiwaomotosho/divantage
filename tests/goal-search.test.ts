// Goal + kit search (doc 26 §6): the spec's goal harness queries (goal-harness.mjs) and the no-results rule (27).
import { expect, test } from "bun:test";
import fs from "node:fs";
import { goalIndexDocs } from "../src/lib/content.server";
import { createGoalSearch } from "../src/lib/search";

const search = createGoalSearch(goalIndexDocs());
const ts = JSON.parse(fs.readFileSync("spec/spec-assets/search/search-test-set.json", "utf8"));

test("goal harness queries find an expected goal or kit in the top 5", () => {
  const failed: string[] = [];
  for (const t of ts.goal_queries) {
    const r = search(t.query, t.market);
    const top = r.slice(0, 5).map((x) => x.doc.id);
    if (r.weak || !t.expect_any_top5.some((e: string) => top.includes(e))) failed.push(`${t.query} → ${r.weak ? "no results" : top.join(", ")}`);
  }
  console.log(`goal harness: ${ts.goal_queries.length - failed.length}/${ts.goal_queries.length}`);
  expect(failed).toEqual([]);
});

test("natural-language query finds the kit", () => {
  const r = search("I want to get a remote job that pays in dollars", "ng");
  expect(r.weak).toBe(false);
  expect(r.slice(0, 12).some((x) => x.doc.id === "kit:get-a-remote-job")).toBe(true);
});

test("off-topic query gives no results", () => {
  expect(search("fix a leaking roof", "ng").weak).toBe(true);
});
