import { randomId } from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSession } from '@deadlock/persistence';

type LevelSession = {
  levelId: string;
  completed: boolean;
  tries: number;
  time: number;
};

export async function storeSession(
  em: EntityManager,
  ip: string,
  { levelId, completed, tries, time }: LevelSession
) {
  const session = new SqlSession();

  session.id = randomId();
  session.date = new Date();
  session.ip = ip;
  session.level = em.getReference(SqlLevel, levelId);
  session.completed = completed;
  session.tries = tries;
  session.time = time;

  await em.persistAndFlush(session);
}
