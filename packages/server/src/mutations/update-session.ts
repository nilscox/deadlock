import { EntityManager, SqlSession } from '@deadlock/persistence';

type UpdateLevelSession = {
  sessionId: string;
  completed: boolean;
  time: number;
};

export async function updateSession(em: EntityManager, { sessionId, completed, time }: UpdateLevelSession) {
  const session = await em.findOneOrFail(SqlSession, { id: sessionId });

  session.completed = completed;
  session.tries += 1;
  session.time += time;

  await em.flush();
}
