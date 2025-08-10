import { token } from 'ditox';
import type { Router } from 'express';

import type { ConfigPort } from './infra/config.ts';
import type { Database, DrizzleDatabase } from './infra/database.ts';
import type { DatePort } from './infra/date.ts';
import type { GeneratorPort } from './infra/generator.ts';
import type { LoggerPort } from './infra/logger.ts';
import type Server from './infra/server.ts';
import type { CreateLevelMutation } from './mutations/create-level.ts';
import type { CreateSessionMutation } from './mutations/create-session.ts';
import type { FlagLevelMutation } from './mutations/flag-level.ts';
import type { RecomputeDifficultiesMutation } from './mutations/recompute-difficulties.ts';
import type { UpdateSessionMutation } from './mutations/update-session.ts';
import type { GetLevelsQuery } from './queries/get-levels.ts';

export const TOKENS = {
  generator: token<GeneratorPort>('generator'),
  date: token<DatePort>('date'),
  logger: token<LoggerPort>('logger'),
  config: token<ConfigPort>('config'),
  db: token<DrizzleDatabase>('db'),
  database: token<Database>('database'),
  server: token<Server>('server'),
  api: token<Router>('api'),
};

export const QUERIES = {
  getLevels: token<GetLevelsQuery>('queries.getLevels'),
};

export const MUTATIONS = {
  createLevel: token<CreateLevelMutation>('mutations.createLevel'),
  flagLevel: token<FlagLevelMutation>('mutations.flagLevel'),
  recomputeDifficulties: token<RecomputeDifficultiesMutation>('mutations.recomputeDifficulties'),
  createSession: token<CreateSessionMutation>('mutations.createSession'),
  updateSession: token<UpdateSessionMutation>('mutations.updateSession'),
};
