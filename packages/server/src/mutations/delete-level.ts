import { EntityManager, SqlLevel } from '@deadlock/persistence';

import { updateLevel } from './upate-level';

export async function deleteLevel(em: EntityManager, levelId: string) {
  const level = await em.findOneOrFail(SqlLevel, levelId);

  await updateLevel(em, level.id, { position: null });

  level.deletedAt = new Date();
  await em.flush();
}
