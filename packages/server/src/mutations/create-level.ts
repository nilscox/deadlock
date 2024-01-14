import { Level, LevelDefinition } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export async function createLevel(em: EntityManager, definition: LevelDefinition) {
  const fingerprint = Level.load(definition).fingerprint;

  const sqlLevel = em.assign(new SqlLevel(), {
    id: nanoidShort(),
    fingerprint,
    difficulty: 0,
    ...definition,
  });

  await em.persistAndFlush(sqlLevel);

  return sqlLevel.id;
}
