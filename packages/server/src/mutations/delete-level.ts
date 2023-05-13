import { EntityManager, SqlLevel } from '@deadlock/persistence';

export async function deleteLevel(em: EntityManager, levelId: string) {
  const level = await em.findOneOrFail(SqlLevel, levelId);

  level.deletedAt = new Date();
  await em.flush();
}
