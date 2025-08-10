import type { LevelData } from '@deadlock/game';

import type { Database } from '../infra/database.ts';
import { levelDifficultyView, type levels } from '../schema.ts';

export class GetLevelsQuery {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async execute() {
    const levels = await this.db.query.levels.findMany({
      where: (level, { isNull }) => isNull(level.deletedAt),
      orderBy: (level) => level.position,
    });

    const difficulties = await this.db.select().from(levelDifficultyView);
    const difficultiesMap = new Map(difficulties.map(({ levelId, difficulty }) => [levelId, difficulty]));

    return levels.map((level) => this.formatLevel(level, difficultiesMap.get(level.id) ?? null));
  }

  private formatLevel(level: typeof levels.$inferSelect, difficulty: number | null): LevelData {
    return {
      id: level.id,
      number: level.position ?? undefined,
      flags: level.flags,
      difficulty: {
        effective: difficulty,
        evaluated: level.difficulty,
      },
      definition: {
        width: level.width,
        height: level.height,
        blocks: level.blocks,
        start: level.start,
        teleports: level.teleports,
      },
    };
  }
}
