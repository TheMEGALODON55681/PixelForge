import { test, expect } from '@playwright/test';

test.describe('preview iframe hardening', () => {
  test('sandbox is allow-scripts only and the document carries a CSP', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/forge');
    await page.getByRole('button', { name: 'Try with an example', exact: true }).click();
    await page.getByRole('button', { name: /forge code/i }).click();
    await expect(page.getByRole('status')).toHaveText(/ready/i, { timeout: 60_000 });

    const iframe = page.locator('iframe[title*="Live preview"]');
    await expect(iframe).toBeAttached();
    await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');

    const srcdoc = await iframe.getAttribute('srcdoc');
    expect(srcdoc).toContain('Content-Security-Policy');
    expect(srcdoc).toContain("default-src 'none'");

    // The sandboxed frame renders content, CSP hardening didn't break the preview.
    const frame = page.frameLocator('iframe[title*="Live preview"]');
    await expect(frame.locator('body')).not.toBeEmpty();
  });
});
