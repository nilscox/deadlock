import type { LevelFlag } from '@deadlock/game';
import { eq, sql } from 'drizzle-orm';

import type { Database } from '../infra/database.ts';
import type { DatePort } from '../infra/date.ts';
import type { LoggerPort } from '../infra/logger.ts';
import { levels } from '../schema.ts';

export type FlagLevel = {
  levelId: string;
  flag: LevelFlag;
};

export class FlagLevelMutation {
  private readonly date: DatePort;
  private readonly logger: LoggerPort;
  private readonly database: Database;

  constructor(date: DatePort, logger: LoggerPort, database: Database) {
    this.date = date;
    this.logger = logger;
    this.database = database;
  }

  async execute(data: FlagLevel) {
    this.logger.info(`Adding flag to level ${data.levelId}`, data.flag);

    await this.database
      .update(levels)
      .set({ flags: sql`array_append(${levels.flags}, ${data.flag})`, updatedAt: this.date.now() })
      .where(eq(levels.id, data.levelId));
  }
}
