import { Level, solve } from '@deadlock/game';

import { getEntityManager } from './global';
import { insertLevel } from './insert-level';

export async function create(level: Level) {
  const paths = solve(level);

  if (!paths?.length) {
    throw new Error('level has no solutions');
  }

  await insertLevel(level.definition, paths);
  await getEntityManager().flush();
}
