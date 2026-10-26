// L7 visual regression: every mapped reference route at phone and desktop, light and dark (doc 29 §3).
import { expect, test } from "@playwright/test";
import fs from "node:fs";

const cfg = JSON.parse(fs.readFileSync("design/fidelity.config.json", "utf8")) as { routes: Record<string, string | null>; setup?: Record<string, string> };

// Tablet (834) added: the concept board checks the same files at tablet width (board p. 37).
const viewports = { phone: { width: 390, height: 844 }, tablet: { width: 834, height: 1112 }, desktop: { width: 1440, height: 900 } } as const;
const setup = cfg.setup ?? {};

for (const [screen, route] of Object.entries(cfg.routes)) {
  if (!route) continue;
  for (const [vp, size] of Object.entries(viewports)) {
    for (const theme of ["light", "dark"] as const) {
      test(`${screen} ${vp} ${theme}`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
        await page.goto(route as string, { waitUntil: "networkidle" });
        if (setup[screen]) {
          await page.evaluate(setup[screen]);
          await page.waitForLoadState("networkidle");
          if (screen === "15-helper") await page.locator("[data-da=helper-bar]").waitFor();
        }
        // Load lazy images too, then wait until every image has decoded (full-page shots include off-screen photos).
        await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => i.setAttribute("loading", "eager")));
        await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
        await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => undefined))));
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        await page.evaluate(() => document.fonts.ready);
        // Photo pixels vary with the responsive source the browser picks; mask them (their presence is checked by the
        // design audit) and compare everything around them.
        await expect(page).toHaveScreenshot(`${screen}-${vp}-${theme}.png`, { fullPage: true, mask: [page.locator("[data-da=photo] img")] });
      });
    }
  }
}
