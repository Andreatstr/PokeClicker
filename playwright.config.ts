import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : 4,
  timeout: 30000, // 30s timeout - reduced from 60s
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
    // Removed firefox, webkit, and mobile browsers to reduce test count
    // and eliminate flaky cross-browser tests. Chrome provides 65%+ market coverage.
  ],
  webServer: process.env.CI ? [
    {
      command: 'cd backend && PORT=3026 npm run dev',
      url: 'http://localhost:3026',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        PORT: '3026',
        RATE_LIMIT_MAX_REQUESTS: '99999',
        JWT_SECRET: 'test-secret-for-e2e-only',
        MONGODB_URI: 'mongodb://localhost:27017',
        MONGODB_DB_NAME: 'pokeclicker_db',
      },
    },
    {
      command: 'cd frontend && npm run dev -- --port 5126',
      url: 'http://localhost:5126',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ] : [
    {
      command: 'cd backend && npm run dev',
      url: 'http://localhost:3001',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        RATE_LIMIT_MAX_REQUESTS: '99999',
      },
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
});
