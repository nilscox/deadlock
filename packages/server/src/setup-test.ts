import { LevelDefinition, randomId } from '@deadlock/game';
import { EntityManager, Orm, SqlLevel, SqlSession, createOrm } from '@deadlock/persistence';

const dbUrl = process.env.DB_URL ?? 'postgresql://postgres@localhost/test';
assert(dbUrl.endsWith('/test'), `DB_URL must specify a database named "test", got "${dbUrl}"`);

function createId() {
  return Math.random().toString(36).slice(-6);
}

type Factory<T> = (overrides?: Partial<T>) => T;

const createFactory = <T>(getDefaults: () => T): Factory<T> => {
  return (overrides) => ({ ...getDefaults(), ...overrides });
};

export const createLevelDefinition = createFactory<LevelDefinition>(() => ({
  width: 0,
  height: 0,
  blocks: [],
  start: { x: 0, y: 0 },
  teleports: [],
}));

export const createLevel = createFactory<LevelDefinition>(() => ({
  ...createLevelDefinition(),
  id: createId(),
  fingerprint: randomId(),
  difficulty: 0,
  numberOfSolutionsScore: 0,
  easiestSolutionScore: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

type SqlEntity = SqlLevel | SqlSession;

export const setupTest = () => {
  let orm: Orm;
  let em: EntityManager;

  beforeEach(async () => {
    orm = await createOrm(dbUrl, false);
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

  const debug = (debug = true) => {
    em.config.getLogger().setDebugMode(debug);
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
    debug,
    save,
    create,
  };
};
