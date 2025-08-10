import assert from 'node:assert';
import test, { suite } from 'node:test';

import type { LevelData } from '@deadlock/game';

import { create } from '../infra/factories.ts';
import { levels, sessions } from '../schema.ts';
import { setupTest } from '../setup-test.ts';

import { GetLevelsQuery } from './get-levels.ts';

await suite('GetLevels', async () => {
  const getDatabase = setupTest();

  await test('list levels', async () => {
    const db = getDatabase();
    const query = new GetLevelsQuery(db);

    const level = create.level({
      width: 1,
      height: 1,
      start: { x: 0, y: 0 },
      blocks: [],
      flags: ['cool'],
    });

    await db.insert(levels).values(level);

    assert.deepEqual(await query.execute(), [
      {
        id: level.id,
        number: 0,
        flags: ['cool'],
        difficulty: {
          effective: null,
          evaluated: 0,
        },
        definition: {
          width: 1,
          height: 1,
          start: { x: 0, y: 0 },
          blocks: [],
          teleports: [],
        },
      },
    ] satisfies [LevelData]);
  });

  await test('difficulty', async () => {
    const db = getDatabase();
    const query = new GetLevelsQuery(db);

    const level = create.level({
      difficulty: 2,
    });

    const session = create.session({
      levelId: level.id,
      completed: true,
      tries: 6,
      time: 20_000,
    });

    await db.insert(levels).values(level);
    await db.insert(sessions).values(session);

    const [result] = await query.execute();

    assert.deepEqual(result?.difficulty, {
      effective: 3,
      evaluated: 2,
    } satisfies LevelData['difficulty']);
  });
});
