import { EntityManager, SqlSession } from '@deadlock/persistence';

export async function deleteSession(em: EntityManager, sessionId: string) {
  const session = await em.findOneOrFail(SqlSession, sessionId);
  await em.nativeDelete(SqlSession, session);
}
