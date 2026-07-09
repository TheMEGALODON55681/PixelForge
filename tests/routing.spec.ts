import { test, expect } from '@playwright/test';

test.describe('routing and navigation', () => {
  test('all three routes resolve with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (const path of ['/', '/forge', '/docs']) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
    }
    expect(errors).toEqual([]);
  });

  test('FORGE cta on landing routes to /forge', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^forge$/i }).first().click();
    await expect(page).toHaveURL(/\/forge$/);
  });

  test('nav Docs link routes to /docs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Docs' }).click();
    await expect(page).toHaveURL(/\/docs$/);
  });

  test('docs links back into /forge', async ({ page }) => {
    await page.goto('/docs');
    await page.getByRole('link', { name: /open the forge/i }).click();
    await expect(page).toHaveURL(/\/forge$/);
  });

  test('no pricing route or nav link resolves', async ({ page, request }) => {
    await page.goto('/');
    // PricingCard.tsx is allowed demo content (FR-6), this checks there is no
    // actual "Pricing" navigation link or page, not the demo filename.
    await expect(page.getByRole('link', { name: /^pricing$/i })).toHaveCount(0);

    const res = await request.get('/pricing', { maxRedirects: 0 }).catch((e) => e);
    if (typeof res === 'object' && 'status' in res) {
      expect(res.status()).toBe(404);
    }
  });

  test('forge workspace wordmark links back to landing', async ({ page }) => {
    await page.goto('/forge');
    await page.getByRole('link', { name: /pixelforge/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
