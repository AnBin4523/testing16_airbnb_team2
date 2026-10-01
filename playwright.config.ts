/// <reference types="node" />

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  // BÁO CÁO: console (list) + HTML + JSON + JUnit (CI đọc được)
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: 'https://demo5.cybersoft.edu.vn',
    screenshot: 'only-on-failure', // SCREENSHOT khi fail
    video: 'retain-on-failure',    // video khi fail
    trace: 'retain-on-failure',    // trace (log từng bước + network + DOM) khi fail
    actionTimeout: 10_000,
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});