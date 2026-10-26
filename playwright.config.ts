// Visual regression (doc 29 L7). Baselines live next to the spec; update with:
//   bunx playwright test --update-snapshots   (after an approved design change)
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  testMatch: /.*\.pw\.ts$/,
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:4173" },
  webServer: { command: "bun run scripts/preview.ts", url: "http://localhost:4173", reuseExistingServer: true, timeout: 60_000 },
});
