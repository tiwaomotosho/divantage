// L7 visual regression template. Copy to tests/visual/visual.spec.ts AFTER owner sign-off of each screen.
// First run: npx playwright test tests/visual --update-snapshots  (commit the PNGs).
import { test, expect } from '@playwright/test';
import cfg from '../../design/fidelity.config.json';
const viewports = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } } as const;
for (const [screen, route] of Object.entries(cfg.routes)) {
  if (!route) continue;
  for (const [vp, size] of Object.entries(viewports)) for (const theme of ['light', 'dark'] as const) {
    test(`${screen} ${vp} ${theme}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto(route as string);
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      await expect(page).toHaveScreenshot(`${screen}-${vp}-${theme}.png`, { fullPage: true, maxDiffPixelRatio: 0.01, animations: 'disabled' });
    });
  }
}
