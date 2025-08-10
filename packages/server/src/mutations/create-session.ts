import type { Database } from '../infra/database.ts';
import type { DatePort } from '../infra/date.ts';
import type { GeneratorPort } from '../infra/generator.ts';
import type { LoggerPort } from '../infra/logger.ts';
import { sessions } from '../schema.ts';

type CreateSession = {
  ip: string;
  levelId: string;
  completed: boolean;
  time: number;
};

export class CreateSessionMutation {
  private readonly generator: GeneratorPort;
  private readonly date: DatePort;
  private readonly logger: LoggerPort;
  private readonly database: Database;

  constructor(generator: GeneratorPort, date: DatePort, logger: LoggerPort, database: Database) {
    this.generator = generator;
    this.date = date;
    this.logger = logger;
    this.database = database;
  }

  async execute(data: CreateSession) {
    const id = this.generator.id();

    this.logger.info(`Creating session ${id}`, data);

    await this.database.insert(sessions).values({
      id,
      date: this.date.now(),
      tries: 1,
      ...data,
    });

    return id;
  }
}
