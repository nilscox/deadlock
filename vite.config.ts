import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_APP_BASE_URL,
  plugins: [react()],
  server: {
    port: 8000,
    host: true,
  },
});
