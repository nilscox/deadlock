import { Level, array, toObject } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';

import { setupTest } from '../setup-test';

import { updateLevel } from './upate-level';

describe('updateLevel', () => {
  const { getEntityManager, create } = setupTest();

  it("updates a level's definition", async () => {
    const em = getEntityManager();
    const level = await create.level({ width: 2, height: 1, start: { x: 0, y: 0 } });
    const { definition } = Level.load(level);

    await updateLevel(em, level.id, { definition: { ...definition, start: { x: 1, y: 0 } } });

    const updatedLevel = await em.findOneOrFail(SqlLevel, level.id);

    expect(updatedLevel.start).toEqual({ x: 1, y: 0 });
  });

  describe('set position', () => {
    const getLevels = async (em: EntityManager) => {
      const levels = await em.find(SqlLevel, {}, { orderBy: { position: 'asc' } });

      return toObject(
        levels,
        ({ id }) => id,
        ({ position }) => position,
      );
    };

    it("set a level's position", async () => {
      const em = getEntityManager();
      const level = await create.level({ id: 'new' });
      await Promise.all(array(2, (i) => create.level({ id: String(i + 1), position: i + 1 })));

      await updateLevel(em, level.id, { position: 2 });

      expect(await getLevels(em)).toEqual({
        1: 1,
        new: 2,
        2: 3,
      });
    });

    it("removes a level's position", async () => {
      const em = getEntityManager();
      const [, b] = await Promise.all(array(4, (i) => create.level({ id: String(i + 1), position: i + 1 })));

      await updateLevel(em, b.id, { position: null });

      expect(await getLevels(em)).toEqual({
        1: 1,
        3: 2,
        4: 3,
        2: null,
      });
    });

    it('moves a level to a lower position', async () => {
      const em = getEntityManager();
      const [, , , d] = await Promise.all(
        array(5, (i) => create.level({ id: String(i + 1), position: i + 1 })),
      );

      await updateLevel(em, d.id, { position: 2 });

      expect(await getLevels(em)).toEqual({
        1: 1,
        4: 2,
        2: 3,
        3: 4,
        5: 5,
      });
    });

    it('moves a level to an upper position', async () => {
      const em = getEntityManager();
      const [, b] = await Promise.all(array(5, (i) => create.level({ id: String(i + 1), position: i + 1 })));

      await updateLevel(em, b.id, { position: 4 });

      expect(await getLevels(em)).toEqual({
        1: 1,
        3: 2,
        4: 3,
        2: 4,
        5: 5,
      });
    });
  });
});
