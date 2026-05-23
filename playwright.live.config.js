import { defineConfig } from '@playwright/test';

// Run against the live deployed site -- no Jekyll webServer, no baseURL.
export default defineConfig({
  testDir: './e2e-live',
  timeout: 60 * 1000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'on',
    screenshot: 'on',
    viewport: { width: 1280, height: 800 },
  },
  outputDir: './e2e-live/test-results',
});
