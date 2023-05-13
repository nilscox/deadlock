import { assert, MapSet, Path, toObject } from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSolution } from '@deadlock/persistence';

export async function getSolutions(em: EntityManager) {
  const levels = await em.find(SqlLevel, {});

  const solutions = await em.find(SqlSolution, {}, { orderBy: { complexity: 'asc' } });
  const solutionsMap = new MapSet<SqlLevel, SqlSolution>();

  solutions.forEach((solution) => solutionsMap.add(solution.level, solution));

  const result = toObject(
    levels,
    (level) => level.id,
    (level) => {
      const solutions = solutionsMap.get(level);
      assert(solutions);

      return {
        total: solutions.size,
        items: Array.from(solutions)
          .slice(0, 3)
          .map(({ complexity, path }) => ({ complexity, path: path as Path[] })),
        difficulty: level.difficulty,
        numberOfSolutionsScore: level.numberOfSolutionsScore,
        easiestSolutionScore: level.easiestSolutionScore,
      };
    }
  );

  return result;
}
