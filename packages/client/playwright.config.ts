import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './screenshots',
  fullyParallel: true,
});
