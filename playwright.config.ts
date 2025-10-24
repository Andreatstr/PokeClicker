import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.CI ? 'http://localhost:5126' : 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: [
    {
      command: 'cd backend && PORT=3026 npm run dev',
      url: 'http://localhost:3026',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        RATE_LIMIT_MAX_REQUESTS: '99999',
        PORT: '3026',
      },
    },
    {
      command: 'cd frontend && npm run dev -- --port 5126',
      url: 'http://localhost:5126',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
});
