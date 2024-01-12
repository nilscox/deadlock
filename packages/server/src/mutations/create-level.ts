import { Level, LevelDefinition } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

import { storeSolutions } from './store-solutions';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export async function createLevel(em: EntityManager, definition: LevelDefinition) {
  const fingerprint = Level.load(definition).fingerprint;

  const sqlLevel = em.assign(new SqlLevel(), {
    id: nanoidShort(),
    fingerprint,
    difficulty: 0,
    numberOfSolutionsScore: 0,
    easiestSolutionScore: 0,
    ...definition,
  });

  await em.transactional(async (em) => {
    await em.persistAndFlush(sqlLevel);
    await storeSolutions(em, sqlLevel);
  });

  return sqlLevel.id;
}
