import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

// Config dùng để quay video demo toàn bộ test: npm run test:record
// Video được gom vào thư mục recordings/ (xem reporters/video-collector.ts)
export default defineConfig({
  ...baseConfig,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['./reporters/video-collector.ts', { outputDir: 'recordings' }]],
  use: {
    ...baseConfig.use,
    viewport: { width: 1280, height: 720 },
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
      show: {
        // Tên test + bước đang chạy ở góc trên trái
        test: { level: 'step', position: 'top-left', fontSize: 16 },
        // Tên thao tác (click, fill...) + con trỏ chuột ở góc trên phải
        actions: { duration: 800, position: 'top-right' },
      },
    },
    // Chạy chậm lại để người xem kịp theo dõi
    launchOptions: { slowMo: 300 },
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],
});
