import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { defineConfig } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import { SqlLevel } from './entities/level';
import { SqlSolution } from './entities/solution';
import { SqlLevelSession } from './entities/level-session';

export default defineConfig({
  metadataProvider: TsMorphMetadataProvider,
  type: 'sqlite',
  entities: [SqlLevel, SqlLevelSession, SqlSolution],
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
