import { evaluateLevelDifficulty } from '@deadlock/game';
import { eq } from 'drizzle-orm';

import type { Database } from '../infra/database.ts';
import type { DatePort } from '../infra/date.ts';
import type { LoggerPort } from '../infra/logger.ts';
import { levels as levelsTable } from '../schema.ts';

export class RecomputeDifficultiesMutation {
  private readonly date: DatePort;
  private readonly logger: LoggerPort;
  private readonly database: Database;

  constructor(date: DatePort, logger: LoggerPort, database: Database) {
    this.date = date;
    this.logger = logger;
    this.database = database;
  }

  async execute() {
    const levels = await this.database.query.levels.findMany({
      where: (level, { isNull }) => isNull(level.deletedAt),
    });

    for (const [index, level] of Object.entries(levels)) {
      this.logger.info(`Recomputing difficulty for level ${level.id} (${index}/${String(levels.length)})`);

      await this.database
        .update(levelsTable)
        .set({
          difficulty: evaluateLevelDifficulty(level),
          updatedAt: this.date.now(),
        })
        .where(eq(levelsTable.id, level.id));
    }
  }
}
