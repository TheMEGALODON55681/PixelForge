import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const ROUTES = ['/', '/forge', '/docs'];

test.describe('responsive layout, no horizontal overflow', () => {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route || '/'} at ${viewport.name} (${viewport.width}px) has no horizontal overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  }
});
