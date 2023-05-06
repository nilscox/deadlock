import { LevelDefinition, randomId, toObject } from '@deadlock/game';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import express, { RequestHandler } from 'express';
import * as yup from 'yup';

import { SqlLevel } from './entities/level';
import { SqlLevelSession } from './entities/level-session';

export function api(em: EntityManager) {
  const router = express.Router();

  router.use((req, res, next) => {
    RequestContext.create(em, next);
  });

  router.get('/levels', getLevels(em));
  router.post('/session', storeLevelSession(em));

  return router;
}

const getLevels = (em: EntityManager): RequestHandler => {
  return async (req, res) => {
    const levels = await em.find(SqlLevel, {});
    res.json(toObject(levels, ({ id }) => id, formatLevel));
  };
};

const formatLevel = (level: SqlLevel): LevelDefinition => ({
  width: level.width,
  height: level.height,
  blocks: level.blocks.map(([x, y]) => ({ x, y })),
  start: { x: level.start[0], y: level.start[1] },
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
