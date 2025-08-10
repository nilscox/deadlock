import assert from 'node:assert';
import test, { beforeEach, suite } from 'node:test';

import { omit } from 'remeda';

import type { Database } from '../infra/database.ts';
import { StubDateAdapter } from '../infra/date.ts';
import { create } from '../infra/factories.ts';
import { NoopLoggerAdapter } from '../infra/logger.ts';
import { type Session, levels, sessions } from '../schema.ts';
import { setupTest } from '../setup-test.ts';

import { UpdateSessionMutation } from './update-session.ts';

await suite('UpdateSession', async () => {
  let dateAdapter: StubDateAdapter;
  let logger: NoopLoggerAdapter;
  let database: Database;

  const getDatabase = setupTest();

  beforeEach(() => {
    dateAdapter = new StubDateAdapter();
    logger = new NoopLoggerAdapter();
    database = getDatabase();
  });

  await test('update a new session', async () => {
    const mutation = new UpdateSessionMutation(dateAdapter, logger, database);

    const level = create.level();

    const session = create.session({
      levelId: level.id,
      tries: 1,
      time: 2,
      ip: 'ip',
      date: new Date('2025-01-01'),
    });

    await database.insert(levels).values(level);
    await database.insert(sessions).values(session);

    dateAdapter.date = new Date('2025-01-02');

    await mutation.execute({
      sessionId: session.id,
      completed: false,
      time: 1,
    });

    const results = await database.select().from(sessions);

    assert.ok(results[0]);

    assert.deepStrictEqual<Omit<Session, 'createdAt'>>(omit(results[0], ['createdAt']), {
      id: session.id,
      levelId: level.id,
      completed: false,
      tries: 2,
      time: 3,
      date: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      ip: 'ip',
    });
  });
});
