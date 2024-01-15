import { evaluateLevelDifficulty } from '@deadlock/game';
import { SqlLevel } from '@deadlock/persistence';

import { getEntityManager } from './global';
import { progress } from './progress';

export async function recomputeDifficulties() {
  const em = getEntityManager();
  const levels = await em.find(SqlLevel, {});

  levels.forEach((level, i) => {
    level.difficulty = evaluateLevelDifficulty(level);
    progress(levels.length, i);
  });

  await em.flush();
}
