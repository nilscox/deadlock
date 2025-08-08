import { LevelData } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';

type DifficultiesResult = Array<{
  level_id: string;
  difficulty: number;
}>;

export async function getLevels(em: EntityManager, validated = true) {
  const levels = await em.find(
    SqlLevel,
    { position: validated ? { $ne: null } : { $eq: null } },
    { orderBy: { position: 'asc' } },
  );

  const difficulties: DifficultiesResult = await em.execute('select * from level_difficulty');
  const difficultiesMap = new Map(difficulties.map(({ level_id, difficulty }) => [level_id, difficulty]));

  return levels.map((level) => formatLevel(level, difficultiesMap.get(level.id) ?? null));
}

const formatLevel = (level: SqlLevel, difficulty: number | null): LevelData => ({
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
});
