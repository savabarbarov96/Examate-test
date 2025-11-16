import { defineConfig } from '@playwright/test';

const devPort = parseInt(process.env.FRONTEND_DEV_PORT || '3000', 10);
const devUrl = `http://localhost:${devPort}`;

export default defineConfig({
  testDir: './tests', // You can change this if your tests are in another folder
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: devUrl,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'npm run dev',
    port: devPort,
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
});
