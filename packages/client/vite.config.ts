import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.VITE_APP_BASE_URL,
  plugins: [react()],
  server: {
    port: 8000,
    host: true,
  },
  test: {
    watch: false,
    globals: true,
    reporters: ['verbose'],
  },
});
