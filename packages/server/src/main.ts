import { MikroORM, SqliteDriver } from '@mikro-orm/sqlite';
import cors from 'cors';
import express from 'express';

import { api } from './api';
import mikroOrmConfig from './mikro-orm.config';

const { HOST: host = '0.0.0.0', PORT: port = '3000' } = process.env;

startServer().catch(console.error);

async function startServer() {
  const orm = await MikroORM.init<SqliteDriver>(mikroOrmConfig);
  const em = orm.em;

  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json());
  app.use(api(em));

  app.listen(Number(port), host, () => {
    console.log(`server listening on ${host}:${port}`);
  });
}
