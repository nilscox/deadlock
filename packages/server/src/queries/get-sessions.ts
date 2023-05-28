import { round } from '@deadlock/game';
import { LevelSession } from '@deadlock/game/src/types';
import { EntityManager, SqlSession } from '@deadlock/persistence';

export async function getSessions(em: EntityManager, levelId?: string): Promise<LevelSession[]> {
  const sessions = await em.find(SqlSession, levelId ? { level: levelId } : {}, {
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map(formatSession);
}

const formatSession = (session: SqlSession): LevelSession => ({
  id: session.id,
  levelId: session.level.id,
  date: session.date.toISOString(),
  completed: session.completed,
  time: round(session.time / 1000),
  tries: session.tries,
});
