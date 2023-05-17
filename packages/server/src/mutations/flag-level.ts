import { LevelFlag } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';

export async function flagLevel(em: EntityManager, levelId: string, flag: LevelFlag) {
  const level = await em.findOneOrFail(SqlLevel, levelId);

  level.flags.push(flag);
  await em.flush();
}
