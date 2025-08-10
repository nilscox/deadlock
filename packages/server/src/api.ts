import express from 'express';
import z from 'zod';

import { container } from './container.ts';
import { MUTATIONS, QUERIES } from './tokens.ts';

export const api = express.Router();

api.get('/levels', async (req, res) => {
  res.json(await container.resolve(QUERIES.getLevels).execute());
});

const flagLevelBody = z.object({
  flag: z.union([z.literal('déjàVu'), z.literal('easy'), z.literal('hard'), z.literal('cool')]),
});

api.post('/levels/:levelId/flag', async (req, res) => {
  const mutation = container.resolve(MUTATIONS.flagLevel);
  const { flag } = flagLevelBody.parse(req.body);

  await mutation.execute({
    levelId: req.params.levelId,
    flag,
  });

  res.status(204);
  res.end();
});

const createSessionBody = z.object({
  levelId: z.string(),
  completed: z.boolean(),
  time: z.number(),
});

api.post('/session', async (req, res) => {
  const mutation = container.resolve(MUTATIONS.createSession);
  const body = createSessionBody.parse(req.body);
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress);

  const sessionId = await mutation.execute({
    ip,
    ...body,
  });

  res.contentType('text/plain');
  res.status(201);
  res.send(sessionId);
});

const updateSessionBody = z.object({
  completed: z.boolean(),
  time: z.number(),
});

api.put('/session/:sessionId', async (req, res) => {
  const mutation = container.resolve(MUTATIONS.updateSession);
  const body = updateSessionBody.parse(req.body);

  await mutation.execute({
    sessionId: req.params.sessionId,
    ...body,
  });

  res.status(204);
  res.end();
});
