import { RequestContext, FilterQuery } from '@mikro-orm/core';
import { EntityManager, MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql';

import config from './mikro-orm.config';

export { serialize } from '@mikro-orm/core';
export * from './entities';
export type { EntityManager, MikroORM as Orm, FilterQuery };

export const createOrm = (clientUrl: string, ssl: boolean, debug: boolean) => {
  return MikroORM.init<PostgreSqlDriver>({
    ...config,
    clientUrl,
    driverOptions: { connection: { ssl } },
    debug,
  });
};

export const ormMiddleware = (em: EntityManager) => {
  return (_req: unknown, _res: unknown, next: () => void) => {
    RequestContext.create(em, next);
  };
};
