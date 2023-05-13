import { randomId } from '@deadlock/game';
import { EntityManager, Orm, SqlLevel, SqlSession, SqlSolution, createOrm } from '@deadlock/persistence';

function createId() {
  return Math.random().toString(36).slice(-6);
}

type Factory<T> = (overrides?: Partial<T>) => T;

const createFactory = <T>(getDefaults: () => T): Factory<T> => {
  return (overrides) => ({ ...getDefaults(), ...overrides });
};

export const createLevel = createFactory<SqlLevel>(() => ({
  id: createId(),
  width: 0,
  height: 0,
  blocks: [],
  start: { x: 0, y: 0 },
  teleports: [],
  fingerprint: randomId(),
  position: 0,
  difficulty: 0,
  numberOfSolutionsScore: 0,
  easiestSolutionScore: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

type SqlEntity = SqlLevel | SqlSession | SqlSolution;

export const setupTest = () => {
  let orm: Orm;
  let em: EntityManager;

  beforeEach(async () => {
    orm = await createOrm('postgresql://postgres@localhost/test', true);
    em = orm.em.fork();

    const schemaGenerator = orm.getSchemaGenerator();
    await schemaGenerator.ensureDatabase();
    await schemaGenerator.refreshDatabase();
    await schemaGenerator.clearDatabase();
  });

  afterEach(async () => {
    if (orm) {
      await orm.close(true);
    }
  });

  const getEntityManager = () => {
    return em.fork();
  };

  const save = async <T extends SqlEntity>(entity: T) => {
    await em.persistAndFlush(entity);
    return entity;
  };

  const create = {
    level: (data?: Partial<SqlLevel>) => save(em.assign(new SqlLevel(), createLevel(data))),
  };

  return {
    getEntityManager,
    save,
    create,
  };
};
