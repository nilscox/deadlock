import { Level, LevelDefinition, evaluateLevelDifficulty } from '@deadlock/game';
import { SqlLevel } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

import { getEntityManager } from './global';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export async function insertLevel(definition: LevelDefinition) {
  const em = getEntityManager();
  const level = Level.load(definition);

  const difficulty = evaluateLevelDifficulty(level.definition);

  const levelEntity = em.assign(new SqlLevel(), {
    id: nanoidShort(),
    fingerprint: level.fingerprint,
    difficulty,
    // position: (await em.count(SqlLevel, {}, { filters: { 'not-deleted': false } })) + 1,
    ...definition,
  });

  em.persist(levelEntity);

  await em.flush();
}
