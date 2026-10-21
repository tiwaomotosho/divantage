// Parity with spec/spec-assets/reference_engine.py (TC-079, TC-081). Fixture: tests/fixtures/engine-reference.json.
import { describe, expect, test } from "bun:test";
import ref from "./fixtures/engine-reference.json";
import { db } from "../src/lib/content.server";

const E = db().engine;
const strip = (lens: any) =>
  lens && { ...lens, path: Object.fromEntries(Object.entries(lens.path).map(([k, v]: any) => [k, v.map(({ slug, ...rest }: any) => rest)])) };

describe("identity engine parity", () => {
  for (const [slug, expected] of Object.entries(ref.resolve)) {
    test(`resolve ${slug}`, () => expect(E.resolve(slug)).toEqual(expected as any));
  }
  for (const [key, expected] of Object.entries(ref.lens) as [string, any][]) {
    test(`pick_lens ${key}`, () => {
      const [id, tool] = key.split("|");
      const got = E.pickLens(id, tool);
      expect(got.need).toEqual(expected.need);
      expect(got.others).toEqual(expected.others);
      if (expected.lens) expect(strip(got.lens)).toEqual(expected.lens);
    });
  }
});
