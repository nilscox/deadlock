import { assert, evaluateLevelDifficulty, solve } from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSolution } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function storeSolutions(em: EntityManager, level: SqlLevel) {
  const paths = solve(level, 512);

  assert(paths, 'Level has too many solutions');
  assert(paths.length > 0, 'Level has no solutions');

  const {
    //
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    solutionsComplexities,
  } = evaluateLevelDifficulty(level, paths);

  em.assign(level, {
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
  });

  const solutions = paths.map((path) =>
    em.assign(new SqlSolution(), {
      id: nanoid(),
      level,
      path,
      complexity: solutionsComplexities?.get(path),
    })
  );

  em.persist(solutions);
  await em.flush();
}
