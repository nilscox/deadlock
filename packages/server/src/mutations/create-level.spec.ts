import { Level } from '@deadlock/game';
import { SqlLevel, SqlSolution } from '@deadlock/persistence';

import { createLevelDefinition, setupTest } from '../setup-test';

import { createLevel } from './create-level';

describe('createLevel', () => {
  const { getEntityManager } = setupTest();

  it('saves a new level', async () => {
    const em = getEntityManager();
    const definition = createLevelDefinition({ width: 2, height: 1, start: { x: 0, y: 0 } });

    const levelId = await createLevel(em.fork(), definition);

    const created = await em.findOneOrFail(SqlLevel, levelId);

    expect(Level.load(created).definition).toEqual(definition);
  });

  it("saves the new level's solutions", async () => {
    const em = getEntityManager();
    const definition = createLevelDefinition({ width: 2, height: 1, start: { x: 0, y: 0 } });

    const levelId = await createLevel(em.fork(), definition);

    const solutions = await em.find(SqlSolution, { level: levelId });

    expect(solutions).toHaveLength(1);
  });

  it('does not save a level having no solutions', async () => {
    const em = getEntityManager();
    const definition = createLevelDefinition({
      width: 3,
      height: 1,
      start: { x: 0, y: 0 },
      blocks: [{ x: 1, y: 0 }],
    });

    await expect(createLevel(em.fork(), definition)).rejects.toThrow('Level has no solutions');
  });
});
