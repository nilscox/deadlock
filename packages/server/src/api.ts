import {
  LevelDefinition,
  LevelsStats,
  MapSet,
  Path,
  assert,
  max,
  mean,
  min,
  randomId,
  round,
  toObject,
} from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSession, SqlSolution, ormMiddleware } from '@deadlock/persistence';
import { RequestHandler, Router } from 'express';
import * as yup from 'yup';

import { updateLevel } from './mutations/upate-level';

/* eslint-disable @typescript-eslint/no-misused-promises */

const updateLevelSchema = yup.object({
  position: yup.number().min(0).optional(),
});

export function api(em: EntityManager) {
  const router = Router();

  router.use(ormMiddleware(em));

  router.get('/levels', getLevels(em));
  router.get('/levels/all', getLevels(em, true));
  router.post('/session', storeLevelSession(em));

  router.patch('/level/:levelId', async (req, res) => {
    const levelId = req.params.levelId;
    const body = await updateLevelSchema.validate(req.body);

    await updateLevel(em, levelId, body);

    res.status(204);
    res.end();
  });

  router.get('/stats', getStatistics(em));
  router.get('/solutions', getSolutions(em));

  return router;
}

const getLevels = (em: EntityManager, all = false): RequestHandler => {
  return async (req, res) => {
    const levels = await em.find(SqlLevel, all ? {} : { position: { $ne: null } }, {
      orderBy: { position: 'asc' },
    });

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

    const session = new SqlSession();

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
    const map = new MapSet<string, SqlSession>();

    for (const session of await em.find(SqlSession, {})) {
      map.add(session.level.id, session);
    }

    const stats: LevelsStats = {};

    for (const [levelId, session] of map) {
      stats[levelId] = formatLevelStats(Array.from(session));
    }

    res.json(stats);
  };
};

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
            .map(({ complexity, path }) => ({ complexity, path: path as Path[] })),
          difficulty: level.difficulty,
          numberOfSolutionsScore: level.numberOfSolutionsScore,
          easiestSolutionScore: level.easiestSolutionScore,
        };
      }
    );

    res.json(result);
  };
};
