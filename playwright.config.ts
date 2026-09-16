import { defineConfig, devices } from '@playwright/test';
import { TimeOutConstant } from './constants/TimeOutConstant';

export default defineConfig({
  testDir: './tests',
  timeout: TimeOutConstant.TEST_TIMEOUT,
  expect: {
    timeout: TimeOutConstant.EXPECT_TIMEOUT,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://demo5.cybersoft.edu.vn/',
    actionTimeout: TimeOutConstant.ACTION_TIMEOUT,
    navigationTimeout: TimeOutConstant.NAVIGATION_TIMEOUT,
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
  ],
});
