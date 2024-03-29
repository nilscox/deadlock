import { LevelDefinition, LevelFlag } from '@deadlock/game';
import { EntityManager, ormMiddleware } from '@deadlock/persistence';
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import * as yup from 'yup';

import { createLevel } from './mutations/create-level';
import { createSession } from './mutations/create-session';
import { deleteLevel } from './mutations/delete-level';
import { deleteSession } from './mutations/delete-session';
import { flagLevel } from './mutations/flag-level';
import { updateLevel } from './mutations/upate-level';
import { updateSession } from './mutations/update-session';
import { getLevels } from './queries/get-levels';
import { getSessions } from './queries/get-sessions';
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

  router.get('/levels/unvalidated', async (req, res) => {
    const levels = await getLevels(em, false);

    res.status(200);
    res.json(levels.reverse());
  });

  router.post('/session', async (req, res) => {
    const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress);
    const body = await createSessionBodySchema.validate(req.body);

    const sessionId = await createSession(em, ip, body);

    res.status(201);
    res.contentType('text/plain');
    res.send(sessionId);
  });

  router.put('/session/:sessionId', async (req, res) => {
    const body = await updateSessionBodySchema.validate(req.body);

    await updateSession(em, { sessionId: req.params.sessionId, ...body });

    res.status(204);
    res.end();
  });

  router.post('/level/:levelId/flag', async (req, res) => {
    const levelId = req.params.levelId;
    const { flag } = await flagLevelBodySchema.validate(req.body);

    await flagLevel(em, levelId, flag);

    res.status(204);
    res.end();
  });

  router.post('/level', async (req, res) => {
    const body = await createLevelBodySchema.validate(req.body);

    await createLevel(em, body.definition as LevelDefinition);

    res.status(204);
    res.end();
  });

  router.patch('/level/:levelId', admin, async (req, res) => {
    const levelId = req.params.levelId;
    const body = await updateLevelSchema.validate(req.body);

    await updateLevel(em, levelId, body);

    res.status(204);
    res.end();
  });

  router.delete('/level/:levelId', admin, async (req, res) => {
    const levelId = req.params.levelId;

    await deleteLevel(em, levelId);

    res.status(204);
    res.end();
  });

  router.get('/level/:levelId/sessions', admin, async (req, res) => {
    const sessions = await getSessions(em, req.params.levelId);

    res.status(200);
    res.json(sessions);
  });

  router.delete('/session/:sessionId', admin, async (req, res) => {
    await deleteSession(em, req.params.sessionId);

    res.status(204);
    res.end();
  });

  router.get('/stats', admin, async (req, res) => {
    const stats = await getStats(em, getLevelIds(req.query.levelId));

    res.status(200);
    res.json(stats);
  });

  router.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500);
    res.json({ error: err.message });
  });

  return router;
}

const getLevelIds = (levelId: unknown) => {
  if (typeof levelId === 'string') {
    return [levelId];
  }

  if (Array.isArray(levelId)) {
    return levelId as string[];
  }

  return undefined;
};

const admin: RequestHandler = (req, res, next) => {
  if (!process.env.ADMIN_TOKEN) {
    return next();
  }

  const token = req.headers['authorization'] ?? '';

  if (token !== process.env.ADMIN_TOKEN) {
    res.status(401);
    res.end();
  } else {
    next();
  }
};

const updateLevelSchema = yup.object({
  position: yup.number().min(0).nullable().optional(),
});

const createSessionBodySchema = yup.object({
  levelId: yup.string().required(),
  completed: yup.boolean().required(),
  time: yup.number().required(),
});

const updateSessionBodySchema = yup.object({
  completed: yup.boolean().required(),
  time: yup.number().required(),
});

const createLevelBodySchema = yup.object({
  definition: yup.object().required(),
});

const flagLevelBodySchema = yup.object({
  flag: yup.string().oneOf(Object.values(LevelFlag)).required(),
});
