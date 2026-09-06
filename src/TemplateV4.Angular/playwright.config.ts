import { defineConfig } from '@playwright/test';
export default defineConfig({
  expect: { timeout: 20000 },
  testDir: './e2e',
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: 'https://localhost:9443',
    ignoreHTTPSErrors: true,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  reporter: 'list',
  outputDir: '../../artifacts/browser-tests',
});
