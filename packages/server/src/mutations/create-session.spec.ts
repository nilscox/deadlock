import assert from 'node:assert';
import test, { beforeEach, suite } from 'node:test';

import { omit } from 'remeda';

import type { Database } from '../infra/database.ts';
import { StubDateAdapter } from '../infra/date.ts';
import { create } from '../infra/factories.ts';
import { StubGeneratorAdapter } from '../infra/generator.ts';
import { NoopLoggerAdapter } from '../infra/logger.ts';
import { type Session, levels, sessions } from '../schema.ts';
import { setupTest } from '../setup-test.ts';

import { CreateSessionMutation } from './create-session.ts';

await suite('CreateSession', async () => {
  let generator: StubGeneratorAdapter;
  let dateAdapter: StubDateAdapter;
  let logger: NoopLoggerAdapter;
  let database: Database;

  const getDatabase = setupTest();

  beforeEach(() => {
    generator = new StubGeneratorAdapter();
    dateAdapter = new StubDateAdapter();
    logger = new NoopLoggerAdapter();
    database = getDatabase();
  });

  await test('create a new session', async () => {
    const mutation = new CreateSessionMutation(generator, dateAdapter, logger, database);

    const level = create.level();

    await database.insert(levels).values(level);

    dateAdapter.date = new Date('2025-01-01');

    const sessionId = await mutation.execute({
      levelId: level.id,
      completed: false,
      time: 2,
      ip: 'ip',
    });

    const results = await database.select().from(sessions);

    assert.ok(results[0]);

    assert.deepStrictEqual<Omit<Session, 'createdAt' | 'updatedAt'>>(
      omit(results[0], ['createdAt', 'updatedAt']),
      {
        id: sessionId,
        levelId: level.id,
        completed: false,
        tries: 1,
        time: 2,
        date: new Date('2025-01-01'),
        ip: 'ip',
      },
    );
  });
});
