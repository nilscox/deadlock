import {
  LevelDefinition,
  LevelsStats,
  MapSet,
  assert,
  max,
  mean,
  min,
  randomId,
  round,
  toObject,
} from '@deadlock/game';
import express, { RequestHandler } from 'express';
import * as yup from 'yup';

import { EntityManager, SqlLevel, SqlLevelSession, SqlSolution, ormMiddleware } from '@deadlock/persistence';

export function api(em: EntityManager) {
  const router = express.Router();

  router.use(ormMiddleware(em));

  router.get('/levels', getLevels(em));
  router.post('/session', storeLevelSession(em));
  router.get('/stats', getStatistics(em));
  router.get('/solutions', getSolutions(em));

  return router;
}

const getLevels = (em: EntityManager): RequestHandler => {
  return async (req, res) => {
    const levels = await em.find(
      SqlLevel,
      {},
      {
        orderBy: {
          levelNumber: 'asc nulls last' as 'asc_nulls_last',
          difficulty: 'asc',
        },
      }
    );
    res.json(toObject(levels, ({ id }) => id, formatLevel));
  };
};

const formatLevel = (level: SqlLevel): LevelDefinition => ({
  width: level.width,
  height: level.height,
  blocks: level.blocks,
  start: level.start,
  teleports: level.teleports,
});

const sessionBodySchema = yup.object({
  levelId: yup.string().required(),
  completed: yup.boolean().required(),
  tries: yup.number().required(),
  time: yup.number().required(),
});

const storeLevelSession = (em: EntityManager): RequestHandler => {
  return async (req, res) => {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress);
    const body = await sessionBodySchema.validate(req.body);

    const session = new SqlLevelSession();

    session.id = randomId();
    session.date = new Date();
    session.ip = ip;
    session.level = em.getReference(SqlLevel, body.levelId);
    session.completed = body.completed;
    session.tries = body.tries;
    session.time = body.time;

    await em.persistAndFlush(session);

    res.status(204);
    res.end();
  };
};

const getStatistics = (em: EntityManager): RequestHandler => {
  return async (req, res) => {
    const map = new MapSet<string, SqlLevelSession>();

    for (const session of await em.find(SqlLevelSession, {})) {
      map.add(session.level.id, session);
    }

    const stats: LevelsStats = {};

    for (const [levelId, session] of map) {
      stats[levelId] = formatLevelStats(Array.from(session));
    }

    res.json(stats);
  };
};

const formatLevelStats = (sessions: SqlLevelSession[]) => ({
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

const getSolutions = (em: EntityManager): RequestHandler => {
  return async (req, res) => {
    const levels = await em.find(SqlLevel, {});

    const solutions = await em.find(SqlSolution, {}, { orderBy: { complexity: 'asc' } });
    const solutionsMap = new MapSet<SqlLevel, SqlSolution>();

    solutions.forEach((solution) => solutionsMap.add(solution.level, solution));

    const result = toObject(
      levels,
      (level) => level.id,
      (level) => {
        const solutions = solutionsMap.get(level);
        assert(solutions);

        return {
          total: solutions.size,
          items: Array.from(solutions)
            .slice(0, 3)
            .map(({ complexity, path }) => ({ complexity, path })),
          difficulty: level.difficulty,
          numberOfSolutionsScore: level.numberOfSolutionsScore,
          easiestSolutionScore: level.easiestSolutionScore,
        };
      }
    );

    res.json(result);
  };
};
