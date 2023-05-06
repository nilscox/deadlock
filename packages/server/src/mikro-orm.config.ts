import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { defineConfig } from '@mikro-orm/sqlite';
import { SqlLevel } from './entities/level';
import { SqlLevelSession } from './entities/level-session';

const { DB_PATH: dbPath = './db.sqlite' } = process.env;

export default defineConfig({
  type: 'sqlite',
  entities: [SqlLevel, SqlLevelSession],
  dbName: dbPath,
  highlighter: new SqlHighlighter(),
  debug: true,
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
