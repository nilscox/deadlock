import { EntityManager, RequestContext } from '@mikro-orm/core';
import express from 'express';
import { RequestHandler } from 'express';
import { SqlLevel } from './entities/level';
import { LevelDefinition, toObject } from '@deadlock/game';

export function api(em: EntityManager) {
  const router = express.Router();

  router.use((req, res, next) => {
    RequestContext.create(em, next);
  });

  router.get('/levels', getLevels(em));

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
