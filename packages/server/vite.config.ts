import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    globals: true,
    threads: false,
    reporters: ['verbose'],
  },
});
