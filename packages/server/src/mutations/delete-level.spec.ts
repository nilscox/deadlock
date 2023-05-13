import { SqlLevel } from '@deadlock/persistence';

import { setupTest } from '../setup-test';

import { deleteLevel } from './delete-level';

describe('deleteLevel', () => {
  const { getEntityManager, create } = setupTest();

  it('soft deletes a level', async () => {
    const em = getEntityManager();
    const level = await create.level();

    await deleteLevel(em, level.id);

    expect(await em.findOne(SqlLevel, { id: level.id })).toBeNull();
  });
});
