import { LevelDefinition } from '@deadlock/game';
import { EntityManager, ormMiddleware } from '@deadlock/persistence';
import { Router } from 'express';
import * as yup from 'yup';

import { createLevel } from './mutations/create-level';
import { deleteLevel } from './mutations/delete-level';
import { storeSession } from './mutations/store-session';
import { updateLevel } from './mutations/upate-level';
import { getLevels } from './queries/get-levels';
import { getSolutions } from './queries/get-solutions';
import { getStats } from './queries/get-stats';

/* eslint-disable @typescript-eslint/no-misused-promises */

export function api(em: EntityManager) {
  const router = Router();

  router.use(ormMiddleware(em));

  router.get('/levels', async (req, res) => {
    const levels = await getLevels(em);

    res.status(200);
    res.json(levels);
  });

  router.post('/session', async (req, res) => {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress);
    const body = await sessionBodySchema.validate(req.body);

    await storeSession(em, ip, body);

    res.status(204);
    res.end();
  });

  router.post('/level', async (req, res) => {
    const body = await createLevelBodySchema.validate(req.body);

    await createLevel(em, body.definition as LevelDefinition);

    res.status(204);
    res.end();
  });

  router.patch('/level/:levelId', async (req, res) => {
    const levelId = req.params.levelId;
    const body = await updateLevelSchema.validate(req.body);

    await updateLevel(em, levelId, body);

    res.status(204);
    res.end();
  });

  router.delete('/level/:levelId', async (req, res) => {
    const levelId = req.params.levelId;

    await deleteLevel(em, levelId);

    res.status(204);
    res.end();
  });

  router.get('/stats', async (req, res) => {
    const stats = await getStats(em);

    res.status(200);
    res.json(stats);
  });

  router.get('/solutions', async (req, res) => {
    const stats = await getSolutions(em);

    res.status(200);
    res.json(stats);
  });

  return router;
}

const updateLevelSchema = yup.object({
  position: yup.number().min(0).optional(),
});

const sessionBodySchema = yup.object({
  levelId: yup.string().required(),
  completed: yup.boolean().required(),
  tries: yup.number().required(),
  time: yup.number().required(),
});

const createLevelBodySchema = yup.object({
  definition: yup.object().required(),
});
