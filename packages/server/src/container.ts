import { createContainer, injectable, injectableClass } from 'ditox';

import { api } from './api.ts';
import { EnvConfigAdapter } from './infra/config.ts';
import { Database } from './infra/database.ts';
import { DateAdapter } from './infra/date.ts';
import { NanoIdGeneratorAdapter } from './infra/generator.ts';
import { ConsoleLoggerAdapter } from './infra/logger.ts';
import Server from './infra/server.ts';
import { CreateLevelMutation } from './mutations/create-level.ts';
import { CreateSessionMutation } from './mutations/create-session.ts';
import { FlagLevelMutation } from './mutations/flag-level.ts';
import { RecomputeDifficultiesMutation } from './mutations/recompute-difficulties.ts';
import { UpdateSessionMutation } from './mutations/update-session.ts';
import { GetLevelsQuery } from './queries/get-levels.ts';
import { MUTATIONS, QUERIES, TOKENS } from './tokens.ts';

export const container = createContainer();

container.bindFactory(TOKENS.generator, injectableClass(NanoIdGeneratorAdapter));
container.bindFactory(TOKENS.date, injectableClass(DateAdapter));
container.bindFactory(TOKENS.config, injectableClass(EnvConfigAdapter));
container.bindFactory(TOKENS.logger, injectableClass(ConsoleLoggerAdapter));
container.bindFactory(TOKENS.db, injectable(Database.createDrizzle, TOKENS.config));
container.bindFactory(TOKENS.database, injectableClass(Database, TOKENS.db));
container.bindFactory(TOKENS.server, injectableClass(Server, TOKENS.config, TOKENS.logger, TOKENS.api));

container.bindValue(TOKENS.api, api);

container.bindFactory(QUERIES.getLevels, injectableClass(GetLevelsQuery, TOKENS.database));

container.bindFactory(
  MUTATIONS.createLevel,
  injectableClass(CreateLevelMutation, TOKENS.generator, TOKENS.logger, TOKENS.database),
);

container.bindFactory(
  MUTATIONS.flagLevel,
  injectableClass(FlagLevelMutation, TOKENS.date, TOKENS.logger, TOKENS.database),
);

container.bindFactory(
  MUTATIONS.recomputeDifficulties,
  injectableClass(RecomputeDifficultiesMutation, TOKENS.date, TOKENS.logger, TOKENS.database),
);

container.bindFactory(
  MUTATIONS.createSession,
  injectableClass(CreateSessionMutation, TOKENS.generator, TOKENS.date, TOKENS.logger, TOKENS.database),
);

container.bindFactory(
  MUTATIONS.updateSession,
  injectableClass(UpdateSessionMutation, TOKENS.date, TOKENS.logger, TOKENS.database),
);
