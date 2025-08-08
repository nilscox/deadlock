import { LevelsStats, round, toObject } from '@deadlock/game';
import { EntityManager } from '@deadlock/persistence';

type CountResult = Array<{
  level_id: string;
  count: string;
}>;

type SessionsResult = Array<{
  level_id: string;
  tries_min: number;
  tries_max: number;
  tries_avg: number;
  time_min: number;
  time_max: number;
  time_avg: number;
}>;

export async function getStats(em: EntityManager, levelIds?: string[]): Promise<LevelsStats> {
  const count: CountResult = await em.execute('select level_id, count(*) from session group by level_id');
  const countMap = new Map(count.map(({ level_id, count }) => [level_id, Number(count)]));

  const sessions: SessionsResult = await em.execute('select * from level_sessions');

  return toObject(
    sessions.filter((session) => !levelIds || levelIds.includes(session.level_id)),
    (session) => session.level_id,
    (session) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      played: countMap.get(session.level_id)!,
      tries: {
        min: session.tries_min,
        max: session.tries_max,
        mean: round(session.tries_avg),
      },
      playTime: {
        min: session.time_min,
        max: session.time_max,
        mean: round(session.time_avg),
      },
    }),
  );
}
