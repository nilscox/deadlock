import { EntityManager, Orm } from '@deadlock/persistence';

let orm: Orm;
let em: EntityManager;

export const setOrm = (_orm: Orm, _em: EntityManager) => {
  orm = _orm;
  em = _em;
};

export const getOrm = () => {
  return orm;
};

export const getEntityManager = () => {
  return em;
};
