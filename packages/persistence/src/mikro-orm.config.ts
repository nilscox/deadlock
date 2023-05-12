import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import { SqlLevel } from './entities/sql-level';
import { SqlSession } from './entities/sql-session';
import { SqlSolution } from './entities/sql-solution';

const clientUrl = process.env.DB_URL;
const debug = process.env.DB_DEBUG === 'true';

export default defineConfig({
  metadataProvider: TsMorphMetadataProvider,
  type: 'postgresql',
  entities: [SqlLevel, SqlSession, SqlSolution],
  clientUrl,
  debug,
  highlighter: new SqlHighlighter(),
  migrations: {
    path: './src/migrations',
    snapshot: false,
  },
  cache: {
    options: {
      cacheDir: 'node_modules/.cache/mikro-orm',
    },
  },
});
