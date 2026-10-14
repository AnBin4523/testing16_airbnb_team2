import { defineConfig, devices } from '@playwright/test';
import { TimeOutConstant } from './constants/TimeOutConstant';

export default defineConfig({
  testDir: './tests',
  timeout: TimeOutConstant.TEST_TIMEOUT,
  expect: {
    timeout: TimeOutConstant.EXPECT_TIMEOUT,
  },
  fullyParallel: false,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://demo5.cybersoft.edu.vn/',
    actionTimeout: TimeOutConstant.ACTION_TIMEOUT,
    navigationTimeout: TimeOutConstant.NAVIGATION_TIMEOUT,
    trace: 'retain-on-failure',
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
    // WebKit on Linux rejects the demo server's weak TLS Diffie-Hellman key
    // ("The Diffie-Hellman prime sent by the server is not acceptable"),
    // so it only runs locally (Windows/macOS), not on CI (Ubuntu).
    ...(process.env.CI
      ? []
      : [
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]),
  ],
});
