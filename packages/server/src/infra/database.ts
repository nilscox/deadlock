import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '../schema.ts';

import type { ConfigPort } from './config.ts';

export type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;

export class Database {
  public static createDrizzle = (config: ConfigPort) => {
    const client = new Pool({
      connectionString: config.database.url,
      ssl: config.database.ssl,
    });

    return drizzle({
      client,
      schema,
      casing: 'snake_case',
      logger: config.database.log,
    });
  };

  private readonly db: DrizzleDatabase;

  public query: typeof this.db.query;
  public execute: typeof this.db.execute;
  public select: typeof this.db.select;
  public count: typeof this.db.$count;
  public insert: typeof this.db.insert;
  public update: typeof this.db.update;
  public delete: typeof this.db.delete;

  constructor(db: DrizzleDatabase) {
    this.db = db;

    this.query = this.db.query;
    this.execute = this.db.execute.bind(this.db);
    this.select = this.db.select.bind(this.db);
    this.count = this.db.$count.bind(this.db);
    this.insert = this.db.insert.bind(this.db);
    this.update = this.db.update.bind(this.db);
    this.delete = this.db.delete.bind(this.db);
  }

  async close() {
    await this.db.$client.end();
  }
}
