import { QBFilterQuery, RequestContext } from '@mikro-orm/core';
import { EntityManager, MikroORM } from '@mikro-orm/postgresql';

import config from './mikro-orm.config';

export { serialize } from '@mikro-orm/core';
export * from './entities';
export type { EntityManager, MikroORM as Orm, QBFilterQuery };

export const createOrm = (clientUrl: string, ssl: boolean, debug: boolean) => {
  return MikroORM.init({
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
