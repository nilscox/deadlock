import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  plugins: [react()],
  server: {
    port: 8000,
    host: true,
  },
});
