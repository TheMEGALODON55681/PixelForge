import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('forge workspace, engine behavior', () => {
  test('load example, forge, and render the preview', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/forge');

    await page.getByRole('button', { name: 'Try with an example', exact: true }).click();
    const forgeButton = page.getByRole('button', { name: /forge code/i });
    await expect(forgeButton).toBeEnabled();
    await forgeButton.click();

    await expect(page.getByRole('status')).toHaveText(/forging/i, { timeout: 10_000 });
    await expect(page.getByRole('status')).toHaveText(/ready/i, { timeout: 60_000 });
    await expect(page.locator('iframe[title*="Live preview"]')).toBeAttached();
  });

  test('refine updates the output in place', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/forge');
    await page.getByRole('button', { name: 'Try with an example', exact: true }).click();
    await page.getByRole('button', { name: /forge code/i }).click();
    await expect(page.getByRole('status')).toHaveText(/ready/i, { timeout: 60_000 });

    const refineInput = page.getByPlaceholder(/describe a change/i);
    await refineInput.fill('add a footer note that says test');
    await page.getByRole('button', { name: /^refine$/i }).click();

    await expect(page.getByRole('status')).toHaveText(/forging/i, { timeout: 10_000 });
    await expect(page.getByRole('status')).toHaveText(/ready/i, { timeout: 60_000 });
  });

  test('history persists across reload and restores on click', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/forge');
    await page.getByRole('button', { name: 'Try with an example', exact: true }).click();
    await page.getByRole('button', { name: /forge code/i }).click();
    await expect(page.getByRole('status')).toHaveText(/ready/i, { timeout: 60_000 });

    await page.reload();
    const historyButton = page.getByRole('button', { name: /history \(\d+\)/i });
    await expect(historyButton).toBeEnabled();
    await historyButton.click();
    await page.getByRole('button', { name: /^restore$/i }).first().click();
  });
});
