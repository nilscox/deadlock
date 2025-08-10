import { Level, type LevelDefinition, evaluateLevelDifficulty, solve } from '@deadlock/game';
import { isNull, sql } from 'drizzle-orm';

import type { Database } from '../infra/database.ts';
import type { GeneratorPort } from '../infra/generator.ts';
import type { LoggerPort } from '../infra/logger.ts';
import { levels } from '../schema.ts';

type CreateLevel = {
  definition: LevelDefinition;
};

export class CreateLevelMutation {
  private readonly generator: GeneratorPort;
  private readonly logger: LoggerPort;
  private readonly database: Database;

  constructor(generator: GeneratorPort, logger: LoggerPort, database: Database) {
    this.generator = generator;
    this.logger = logger;
    this.database = database;
  }

  async execute(data: CreateLevel) {
    const id = this.generator.id();
    const level = Level.load(data.definition);

    const solutions = solve(level);

    if (!solutions || solutions.length === 0) {
      throw new Error('Level has no solutions');
    }

    this.logger.info(`Creating level ${id}`);

    await this.database.insert(levels).values({
      id,
      fingerprint: level.fingerprint,
      difficulty: evaluateLevelDifficulty(level.definition),
      position: sql<number>`${this.database.count(levels, isNull(levels.deletedAt))} + 1`,
      ...level.definition,
    });

    return id;
  }
}
