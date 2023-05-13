import { Level } from '@deadlock/game';
import { SqlLevel } from '@deadlock/persistence';

import { createLevelDefinition, setupTest } from '../setup-test';

import { createLevel } from './create-level';

describe('createLevel', () => {
  const { getEntityManager } = setupTest();

  it('saves a new level', async () => {
    const em = getEntityManager();

    const definition = createLevelDefinition({
      width: 2,
      height: 1,
      start: { x: 0, y: 0 },
    });

    const levelId = await createLevel(em.fork(), definition);

    const created = await em.findOneOrFail(SqlLevel, levelId);

    expect(new Level(created).definition).toEqual(definition);
  });
});
