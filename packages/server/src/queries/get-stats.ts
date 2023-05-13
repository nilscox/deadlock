import { MapSet, LevelsStats, round, mean, min, max } from '@deadlock/game';
import { EntityManager, SqlSession } from '@deadlock/persistence';

export async function getStats(em: EntityManager) {
  const map = new MapSet<string, SqlSession>();

  for (const session of await em.find(SqlSession, {})) {
    map.add(session.level.id, session);
  }

  const stats: LevelsStats = {};

  for (const [levelId, session] of map) {
    stats[levelId] = formatLevelStats(Array.from(session));
  }

  return stats;
}

const formatLevelStats = (sessions: SqlSession[]) => ({
  played: sessions.length,
  completed: sessions.filter(({ completed }) => completed).length,
  skipped: sessions.filter(({ completed }) => !completed).length,
  tries: {
    mean: round(mean(sessions.map(({ tries }) => tries)), 3),
    min: min(sessions.map(({ tries }) => tries)),
    max: max(sessions.map(({ tries }) => tries)),
  },
  playTime: {
    mean: round(mean(sessions.map(({ time }) => time)), 0),
    min: min(sessions.map(({ time }) => time)),
    max: max(sessions.map(({ time }) => time)),
  },
});
