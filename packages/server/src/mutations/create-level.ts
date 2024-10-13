import { Level, LevelDefinition, solve } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export async function createLevel(em: EntityManager, definition: LevelDefinition) {
  if (!solve(definition)?.length) {
    throw new Error('Level has no solutions');
  }

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
