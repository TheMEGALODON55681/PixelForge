/**
 * Reproducible screenshot captures for the PixelForge README.
 *
 * Boots the dev server, loads a known example image, and captures five shots:
 *   1. idle-with-example  — hero image (upload zone showing example)
 *   2. forging            — mid-stream, scanline visible
 *   3. ready              — completed preview rendered
 *   4. history-drawer     — history panel open with an entry
 *   5. mobile-preview     — output at 375px device width
 *
 * Run:
 *   npx playwright install chromium --with-deps
 *   node scripts/screenshots.mjs
 *
 * Output: assets/ (PNG files, committed alongside the README).
 * Requires: local dev server NOT already running on port 3000.
 *
 * This is a devDependency tool (run via npx). No runtime impact.
 */

import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS = join(ROOT, 'assets');
const BASE_URL = 'http://localhost:3000';
const VIEWPORT = { width: 1280, height: 800 };

if (!existsSync(ASSETS)) mkdirSync(ASSETS, { recursive: true });

/** Wait until the dev server responds, with timeout. */
async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Dev server at ${url} did not start within ${timeoutMs}ms`);
}

/** Load the example image and wait for the upload zone to show a preview. */
async function loadExample(page) {
  await page.getByRole('button', { name: /try with an example/i }).click();
  await page.waitForFunction(() => {
    const img = document.querySelector('label[for="file-upload"] img');
    return img && img.complete && img.naturalWidth > 0;
  });
}

/** Click Forge and wait until the status chip reads "Ready". */
async function forge(page) {
  await page.getByRole('button', { name: /forge code/i }).click();
  // Wait for the stream to complete (status chip changes from Forging → Ready)
  await page.waitForFunction(
    () => document.querySelector('[role="status"]')?.textContent?.toLowerCase().includes('ready'),
    { timeout: 60_000 },
  );
}

async function main() {
  // Start the dev server in the background
  console.log('Starting dev server…');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: true,
    detached: true,
  });
  server.unref();

  try {
    await waitForServer(BASE_URL);
    console.log('Dev server ready.');

    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // ── 1. Idle with example loaded (hero) ──────────────────────────────────
    await loadExample(page);
    await page.screenshot({ path: join(ASSETS, 'screenshot-idle.png'), fullPage: false });
    console.log('✓ screenshot-idle.png');

    // ── 2. Mid-stream "forging" frame ───────────────────────────────────────
    await page.getByRole('button', { name: /forge code/i }).click();
    // Capture while streaming — wait for the scanline to be visible
    await page.waitForFunction(
      () => document.querySelector('[role="status"]')?.textContent?.toLowerCase().includes('forging'),
    );
    await page.screenshot({ path: join(ASSETS, 'screenshot-forging.png'), fullPage: false });
    console.log('✓ screenshot-forging.png');

    // ── 3. Ready — preview rendered ─────────────────────────────────────────
    await page.waitForFunction(
      () => document.querySelector('[role="status"]')?.textContent?.toLowerCase().includes('ready'),
      { timeout: 60_000 },
    );
    await page.screenshot({ path: join(ASSETS, 'screenshot-ready.png'), fullPage: false });
    console.log('✓ screenshot-ready.png');

    // ── 4. History drawer open ───────────────────────────────────────────────
    await page.getByRole('button', { name: /history/i }).click();
    await page.waitForSelector('[role="dialog"]');
    await page.screenshot({ path: join(ASSETS, 'screenshot-history.png'), fullPage: false });
    console.log('✓ screenshot-history.png');
    // Close the drawer
    await page.keyboard.press('Escape');

    // ── 5. Mobile device-width preview (375 px) ──────────────────────────────
    await page.getByRole('button', { name: /mobile width/i }).click();
    await page.screenshot({ path: join(ASSETS, 'screenshot-mobile-preview.png'), fullPage: false });
    console.log('✓ screenshot-mobile-preview.png');

    await browser.close();
    console.log('\nAll screenshots saved to assets/');
  } finally {
    // Kill the dev server process tree
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
      } else {
        process.kill(-server.pid);
      }
    } catch {
      // Best-effort cleanup
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
