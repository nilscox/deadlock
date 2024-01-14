import { Level, solve } from '@deadlock/game';

import { getEntityManager } from './global';
import { insertLevel } from './insert-level';

export async function create(level: Level) {
  const solutions = solve(level);

  if (!solutions?.length) {
    throw new Error('level has no solutions');
  }

  await insertLevel(level.definition);
  await getEntityManager().flush();
}
