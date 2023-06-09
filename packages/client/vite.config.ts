import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(baseConfig, {
  base: process.env.VITE_APP_BASE_URL,
  plugins: [tsconfigPaths(), react()],
  build: {
    sourcemap: true,
  },
  server: {
    port: 8000,
    host: true,
  },
});
