import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['github']],
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  },
  // Start the Next.js dev server automatically for e2e tests
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    cwd: process.cwd(),
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
