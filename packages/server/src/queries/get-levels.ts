import { LevelData } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';

export async function getLevels(em: EntityManager, validated = true) {
  const levels = await em.find(
    SqlLevel,
    { position: validated ? { $ne: null } : { $eq: null } },
    { orderBy: { position: 'asc' } }
  );

  return levels.map(formatLevel);
}

const formatLevel = (level: SqlLevel): LevelData => ({
  id: level.id,
  number: level.position ?? undefined,
  flags: level.flags,
  definition: {
    width: level.width,
    height: level.height,
    blocks: level.blocks,
    start: level.start,
    teleports: level.teleports,
  },
});
