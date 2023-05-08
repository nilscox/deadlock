import { RequestContext } from '@mikro-orm/core';
import { EntityManager, MikroORM, SqliteDriver } from '@mikro-orm/sqlite';

import config from './mikro-orm.config';

export * from './entities/level';
export * from './entities/level-session';
export * from './entities/solution';

export type { EntityManager, MikroORM as Orm };

export const createOrm = (dbPath: string, debug?: boolean) => {
  return MikroORM.init<SqliteDriver>({
    ...config,
    dbName: dbPath,
    debug,
  });
};

export const ormMiddleware = (em: EntityManager) => {
  return (_req: unknown, _res: unknown, next: () => void) => {
    RequestContext.create(em, next);
  };
};
