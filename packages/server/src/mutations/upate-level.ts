import { Level, LevelDefinition } from '@deadlock/game';
import { EntityManager, FilterQuery, SqlLevel, SqlSolution } from '@deadlock/persistence';

import { storeSolutions } from './store-solutions';

type Fields = {
  definition?: LevelDefinition;
  position?: number | null;
};

export async function updateLevel(em: EntityManager, levelId: string, fields: Fields) {
  const level = await em.findOneOrFail(SqlLevel, levelId, { filters: { 'not-deleted': false } });
  const { definition, position } = fields;

  await em.transactional(async (em) => {
    if (definition !== undefined) {
      await updateLevelDefinition(em, level, definition);
    }

    if (position !== undefined) {
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

async function updateLevelPosition(em: EntityManager, level: SqlLevel, position: number | null) {
  if (level.position === position) {
    return;
  }

  const shift = async (sign: '+' | '-', where: Array<FilterQuery<SqlLevel>>) => {
    const qb = em.createQueryBuilder(SqlLevel).update({ position: em.raw(`position ${sign} 1`) });

    where.forEach((where) => void qb.andWhere(where));

    await qb.execute();
  };

  try {
    await em.execute('alter table "level" drop constraint "level_position_unique";');

    if (position === null) {
      await em.createQueryBuilder(SqlLevel).update({ position: null }).where({ id: level.id }).execute();
      await shift('-', [{ position: { $gt: level.position } }]);
      return;
    }

    if (level.position === null) {
      await shift('+', [{ position: { $gte: position } }]);
      await em.createQueryBuilder(SqlLevel).update({ position }).where({ id: level.id }).execute();
      return;
    }

    if (level.position < position) {
      await shift('-', [{ position: { $gte: level.position } }, { position: { $lte: position } }]);
    } else {
      await shift('+', [{ position: { $gte: position } }, { position: { $lte: level.position } }]);
    }

    await em.createQueryBuilder(SqlLevel).update({ position }).where({ id: level.id }).execute();
  } finally {
    await em.execute('alter table "level" add constraint "level_position_unique" unique ("position");');
  }
}
