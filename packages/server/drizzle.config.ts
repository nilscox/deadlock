import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  casing: 'snake_case',
  breakpoints: false,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
