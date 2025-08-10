import assert from 'node:assert';
import test, { beforeEach, suite } from 'node:test';

import type { LevelDefinition } from '@deadlock/game';
import { omit } from 'remeda';

import type { Database } from '../infra/database.ts';
import { StubGeneratorAdapter } from '../infra/generator.ts';
import { NoopLoggerAdapter } from '../infra/logger.ts';
import { type Level, levels } from '../schema.ts';
import { setupTest } from '../setup-test.ts';

import { CreateLevelMutation } from './create-level.ts';

await suite('CreateLevel', async () => {
  let generator: StubGeneratorAdapter;
  let logger: NoopLoggerAdapter;
  let database: Database;

  const getDatabase = setupTest();

  beforeEach(() => {
    generator = new StubGeneratorAdapter();
    logger = new NoopLoggerAdapter();
    database = getDatabase();
  });

  await test('create a new level', async () => {
    const mutation = new CreateLevelMutation(generator, logger, database);

    const definition: LevelDefinition = {
      width: 2,
      height: 1,
      start: { x: 0, y: 0 },
      blocks: [],
      teleports: [],
    };

    const levelId = await mutation.execute({
      definition,
    });

    const results = await database.select().from(levels);

    assert.ok(results[0]);

    assert.deepStrictEqual<Omit<Level, 'createdAt' | 'updatedAt'>>(
      omit(results[0], ['createdAt', 'updatedAt']),
      {
        id: levelId,
        width: 2,
        height: 1,
        blocks: [],
        start: { x: 0, y: 0 },
        teleports: [],
        fingerprint: '1,2S0,0',
        position: 1,
        difficulty: 1,
        flags: [],
        deletedAt: null,
      },
    );
  });

  await test('no solution', async () => {
    const mutation = new CreateLevelMutation(generator, logger, database);

    const definition: LevelDefinition = {
      width: 3,
      height: 1,
      start: { x: 0, y: 0 },
      blocks: [{ x: 1, y: 0 }],
      teleports: [],
    };

    await assert.rejects(() => mutation.execute({ definition }), { message: 'Level has no solutions' });
  });
});
