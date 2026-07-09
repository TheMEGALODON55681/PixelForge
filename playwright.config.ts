import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Serialized: tests share live server-side state (the in-memory rate
  // limiter in lib/rate-limit.ts, and real GPT-4o calls through one
  // GITHUB_MODELS_TOKEN) that isn't safe under parallel workers.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
