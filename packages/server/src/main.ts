import { createOrm } from '@deadlock/persistence';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { json } from 'express';

dotenv.config();

import { api } from './api';
import { config } from './config';

startServer().catch(console.error);

async function startServer() {
  const orm = await createOrm(config.dbUrl, config.dbSsl, config.dbDebug);
  const app = express();

  app.use(cors({ origin: true }));
  app.use(json());
  app.use(api(orm.em));

  const { host, port } = config;

  app.listen(Number(port), host, () => {
    console.log(`server listening on ${host}:${port}`);
  });
}
