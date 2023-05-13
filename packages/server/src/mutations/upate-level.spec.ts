import { array } from '@deadlock/game';
import { SqlLevel, serialize } from '@deadlock/persistence';

import { setupTest } from '../setup-test';

import { updateLevel } from './upate-level';

describe('updateLevel', () => {
  const { getEntityManager, create } = setupTest();

  it("set a level's position", async () => {
    const em = getEntityManager();
    const level = await create.level();

    await updateLevel(em, level.id, { position: 1 });
    await em.refresh(level);

    expect(serialize(level)).toHaveProperty('position', 1);
  });

  it('moves a level to a lower position', async () => {
    const em = getEntityManager();
    const [, , , d] = await Promise.all(
      array(5, (i) => create.level({ id: String(i + 1), position: i + 1 }))
    );

    await updateLevel(em, d.id, { position: 2 });

    const newLevels = await em.find(SqlLevel, {}, { orderBy: { position: 'asc' } });

    expect(newLevels.map((level) => level.id)).toEqual(['1', '4', '2', '3', '5']);
  });

  it('moves a level to an upper position', async () => {
    const em = getEntityManager();
    const [, b] = await Promise.all(array(5, (i) => create.level({ id: String(i + 1), position: i + 1 })));

    await updateLevel(em, b.id, { position: 4 });

    const newLevels = await em.find(SqlLevel, {}, { orderBy: { position: 'asc' } });

    expect(newLevels.map((level) => level.id)).toEqual(['1', '3', '4', '2', '5']);
  });
});
