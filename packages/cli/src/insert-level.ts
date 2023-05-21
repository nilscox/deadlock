import { Level, LevelDefinition, Path, evaluateLevelDifficulty } from '@deadlock/game';
import { SqlLevel, SqlSolution } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

import { getEntityManager } from './global';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function insertLevel(definition: LevelDefinition, paths: Path[]) {
  const em = getEntityManager();
  const level = new Level(definition);

  const {
    //
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    solutionsComplexities,
  } = evaluateLevelDifficulty(level, paths);

  const levelEntity = em.assign(new SqlLevel(), {
    id: nanoidShort(),
    fingerprint: level.fingerprint,
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    position: (await em.count(SqlLevel, {}, { filters: { 'not-deleted': false } })) + 1,
    ...definition,
  });

  const solutionsEntities = paths.map((path) =>
    em.assign(new SqlSolution(), {
      id: nanoid(),
      level: levelEntity,
      complexity: solutionsComplexities?.get(path),
      path,
    })
  );

  em.persist(levelEntity);
  em.persist(solutionsEntities);

  await em.flush();
}
