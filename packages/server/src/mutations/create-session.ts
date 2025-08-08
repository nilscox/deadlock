import { randomId } from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSession } from '@deadlock/persistence';

type CreateLevelSession = {
  levelId: string;
  completed: boolean;
  time: number;
};

export async function createSession(
  em: EntityManager,
  ip: string,
  { levelId, completed, time }: CreateLevelSession,
) {
  const session = new SqlSession();

  session.id = randomId();
  session.date = new Date();
  session.ip = ip;
  session.level = em.getReference(SqlLevel, levelId);
  session.completed = completed;
  session.tries = 1;
  session.time = time;

  await em.persistAndFlush(session);

  return session.id;
}
