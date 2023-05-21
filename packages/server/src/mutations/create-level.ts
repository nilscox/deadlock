import { assert, Level, LevelDefinition, evaluateLevelDifficulty, solve } from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSolution } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function createLevel(em: EntityManager, definition: LevelDefinition) {
  const fingerprint = new Level(definition).fingerprint;
  const position = (await em.count(SqlLevel, {}, { filters: { 'not-deleted': false } })) + 1;
  const solutions = solve(definition, 512);

  assert(solutions, 'Level has too many solutions');
  assert(solutions.length > 0, 'Level has no solutions');

  const {
    //
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    solutionsComplexities,
  } = evaluateLevelDifficulty(definition, solutions);

  const sqlLevel = em.assign(new SqlLevel(), {
    id: nanoidShort(),
    fingerprint,
    position,
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    ...definition,
  });

  const sqlSolutions = solutions.map((path) =>
    em.assign(new SqlSolution(), {
      id: nanoid(),
      level: sqlLevel,
      path,
      complexity: solutionsComplexities?.get(path),
    })
  );

  em.persist(sqlLevel);
  em.persist(sqlSolutions);

  await em.flush();

  return sqlLevel.id;
}
