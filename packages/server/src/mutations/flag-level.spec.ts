import assert from 'node:assert';
import test, { beforeEach, suite } from 'node:test';

import type { Database } from '../infra/database.ts';
import { StubDateAdapter } from '../infra/date.ts';
import { create } from '../infra/factories.ts';
import { NoopLoggerAdapter } from '../infra/logger.ts';
import { type Level, levels } from '../schema.ts';
import { setupTest } from '../setup-test.ts';

import { FlagLevelMutation } from './flag-level.ts';

await suite('FlagLevel', async () => {
  let dateAdapter: StubDateAdapter;
  let logger: NoopLoggerAdapter;
  let database: Database;

  const getDatabase = setupTest();

  beforeEach(() => {
    dateAdapter = new StubDateAdapter();
    logger = new NoopLoggerAdapter();
    database = getDatabase();
  });

  await test('adds a flag to a level', async () => {
    const mutation = new FlagLevelMutation(dateAdapter, logger, database);

    const level = create.level({
      flags: ['hard'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    });

    await database.insert(levels).values(level);

    dateAdapter.date = new Date('2025-01-02');

    await mutation.execute({
      levelId: level.id,
      flag: 'cool',
    });

    const result = await database.query.levels.findFirst();

    assert.ok(result);

    assert.deepStrictEqual<Level['flags']>(result.flags, ['hard', 'cool']);
    assert.deepStrictEqual<Level['updatedAt']>(result.updatedAt, new Date('2025-01-02'));
  });
});
