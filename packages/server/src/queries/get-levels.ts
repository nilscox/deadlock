import { LevelDefinition, LevelFlag, toObject } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';

export async function getLevels(em: EntityManager) {
  const levels = await em.find(SqlLevel, {}, { orderBy: { position: 'asc' } });

  return toObject(levels, ({ id }) => id, formatLevel);
}

const formatLevel = (level: SqlLevel): LevelDefinition & { flags: LevelFlag[] } => ({
  width: level.width,
  height: level.height,
  blocks: level.blocks,
  start: level.start,
  teleports: level.teleports,
  flags: level.flags,
});
