import { eq, sql } from 'drizzle-orm';

import type { Database } from '../infra/database.ts';
import type { DatePort } from '../infra/date.ts';
import type { LoggerPort } from '../infra/logger.ts';
import { sessions } from '../schema.ts';

type UpdateSession = {
  sessionId: string;
  completed: boolean;
  time: number;
};

export class UpdateSessionMutation {
  private readonly date: DatePort;
  private readonly logger: LoggerPort;
  private readonly database: Database;

  constructor(date: DatePort, logger: LoggerPort, database: Database) {
    this.date = date;
    this.logger = logger;
    this.database = database;
  }

  async execute(data: UpdateSession) {
    this.logger.info(`Updating session ${data.sessionId}`, data);

    await this.database
      .update(sessions)
      .set({
        completed: data.completed,
        tries: sql<number>`${sessions.tries} + 1`,
        time: sql<number>`${sessions.time} + ${data.time}`,
        updatedAt: this.date.now(),
      })
      .where(eq(sessions.id, data.sessionId));
  }
}
