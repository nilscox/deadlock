import { Level, LevelDefinition } from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSolution } from '@deadlock/persistence';

import { storeSolutions } from './store-solutions';

type Fields = {
  definition?: LevelDefinition;
  position?: number;
};

export async function updateLevel(em: EntityManager, levelId: string, fields: Fields) {
  const level = await em.findOneOrFail(SqlLevel, levelId);
  const { definition, position } = fields;

  await em.transactional(async (em) => {
    if (definition) {
      await updateLevelDefinition(em, level, definition);
    }

    if (position) {
      await updateLevelPosition(em, level, position);
    }
  });
}

async function updateLevelDefinition(em: EntityManager, level: SqlLevel, definition: LevelDefinition) {
  em.assign(level, {
    width: definition.width,
    height: definition.height,
    start: definition.start,
    blocks: definition.blocks,
    teleports: definition.teleports,
    fingerprint: new Level(level).fingerprint,
  });

  await em.flush();

  await em.nativeDelete(SqlSolution, { level });
  await storeSolutions(em, level);
}

async function updateLevelPosition(em: EntityManager, level: SqlLevel, position: number) {
  await em.execute('alter table "level" drop constraint "level_position_unique";');

  if (position) {
    await em.createQueryBuilder(SqlLevel).update({ position: 0 }).where({ id: level.id }).execute();

    if (position > level.position) {
      await em
        .createQueryBuilder(SqlLevel)
        .update({ position: em.raw(`position - 1`) })
        .where({ position: { $gt: level.position } })
        .andWhere({ position: { $lte: position } })
        .execute();
    } else {
      await em
        .createQueryBuilder(SqlLevel)
        .update({ position: em.raw(`position + 1`) })
        .where({ position: { $gte: position } })
        .andWhere({ position: { $lt: level.position } })
        .execute();
    }

    await em.createQueryBuilder(SqlLevel).update({ position }).where({ id: level.id }).execute();
  }

  await em.execute('alter table "level" add constraint "level_position_unique" unique ("position");');
}
