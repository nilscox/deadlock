import 'dotenv/config';

import { after, afterEach, before, beforeEach } from 'node:test';

import { assert } from '@deadlock/game';
import type {
  generateDrizzleJson as generateDrizzleJsonType,
  generateMigration as generateMigrationType,
} from 'drizzle-kit/api';
import { createRequire } from 'module';
import pg from 'pg';

import { type ConfigPort, StubConfigAdapter } from './infra/config.ts';
import { Database } from './infra/database.ts';
import * as schema from './schema.ts';

// https://github.com/drizzle-team/drizzle-orm/issues/2853#issuecomment-2668459509
const require = createRequire(import.meta.url);

const { generateDrizzleJson, generateMigration } = require('drizzle-kit/api') as {
  generateDrizzleJson: typeof generateDrizzleJsonType;
  generateMigration: typeof generateMigrationType;
};

export function setupTest() {
  let config: ConfigPort;
  let db: Database;

  before(async () => {
    config = new StubConfigAdapter();
    config.database.url = databaseUrl('test');

    await withClient(databaseUrl('postgres'), async (client) => {
      await client.query('drop database if exists test_template');
      await client.query('create database test_template');
    });

    await withClient(databaseUrl('test_template'), migrate);
  });

  after(async () => {
    await withClient(databaseUrl('postgres'), async (client) => {
      await client.query('drop database test_template');
      await client.query('drop database test');
    });
  });

  beforeEach(async () => {
    db = new Database(Database.createDrizzle(config));

    await withClient(databaseUrl('postgres'), async (client) => {
      await client.query('drop database if exists test');
      await client.query('create database test template test_template');
    });
  });

  afterEach(async () => {
    await db.close();
  });

  return () => db;
}

function databaseUrl(name: string) {
  const { TEST_DATABASE_HOST: host, TEST_DATABASE_USER: user } = process.env;

  assert(host);
  assert(user);

  return `postgres://${user}@${host}/${name}`;
}

async function migrate(client: pg.Client) {
  const migrationSchema: Record<string, unknown> = { ...schema };

  delete migrationSchema.sessionsView;
  migrationSchema._01_sessionsView = schema.sessionsView;

  delete migrationSchema.levelDifficultyView;
  migrationSchema._02_levelDifficultyView = schema.levelDifficultyView;

  const migrationStatements = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson(migrationSchema, undefined, undefined, 'snake_case'),
  );

  await client.query(migrationStatements.join('\n'));
}

async function withClient(databaseUrl: string, cb: (client: pg.Client) => Promise<void>) {
  const client = new pg.Client(databaseUrl);

  try {
    await client.connect();
    await cb(client);
  } finally {
    await client.end();
  }
}
