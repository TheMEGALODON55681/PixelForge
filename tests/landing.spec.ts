import { test, expect } from '@playwright/test';

test.describe('landing page reveal', () => {
  test('sections reveal on scroll (opacity settles to 1)', async ({ page }) => {
    await page.goto('/');
    const featuresHeading = page.getByRole('heading', { name: /built for the way you actually work/i });
    await featuresHeading.scrollIntoViewIfNeeded();
    await expect(featuresHeading).toHaveCSS('opacity', '1');
  });

  test('reduced motion shows all content instantly with no transform', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const heading = page.getByRole('heading', { name: /forge clean code from any screenshot/i });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS('opacity', '1');
  });

  test('specimens section is reachable via the See specimens anchor', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /see specimens/i }).click();
    await expect(page.locator('#specimens')).toBeInViewport();
  });
});
