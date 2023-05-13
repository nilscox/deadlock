import { EntityManager, SqlLevel } from '@deadlock/persistence';

type Fields = {
  position?: number;
};

export async function updateLevel(em: EntityManager, levelId: string, fields: Fields) {
  const level = await em.findOneOrFail(SqlLevel, levelId);
  const { position } = fields;

  await em.transactional(async (em) => {
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
  });
}
