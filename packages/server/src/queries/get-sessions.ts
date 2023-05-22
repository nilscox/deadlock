import { EntityManager, SqlSession } from '@deadlock/persistence';

export async function getSessions(em: EntityManager, levelId: string) {
  const sessions = await em.find(SqlSession, { level: levelId });
  return sessions.map(formatSession);
}

const formatSession = (session: SqlSession) => ({
  id: session.id,
  date: session.date,
  completed: session.completed,
  time: session.time,
  tries: session.tries,
});
