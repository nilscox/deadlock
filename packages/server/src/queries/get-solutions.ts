import { assert, LevelsSolutions, MapSet, Path, toObject } from '@deadlock/game';
import { EntityManager, SqlLevel, SqlSolution } from '@deadlock/persistence';

type DifficultiesResult = Array<{
  level_id: string;
  difficulty: number;
}>;

export async function getSolutions(em: EntityManager): Promise<LevelsSolutions> {
  const levels = await em.find(SqlLevel, {});
  const difficulties: DifficultiesResult = await em.execute('select * from level_difficulty');
  const difficultiesMap = new Map(difficulties.map(({ level_id, difficulty }) => [level_id, difficulty]));

  const solutions = await em.find(SqlSolution, {}, { orderBy: { complexity: 'asc' } });
  const solutionsMap = new MapSet<SqlLevel, SqlSolution>();

  solutions.forEach((solution) => solutionsMap.add(solution.level, solution));

  return toObject(
    levels,
    (level) => level.id,
    (level) => {
      const solutions = solutionsMap.get(level);
      assert(solutions, `no solution found for level ${level.id}`);

      return {
        total: solutions.size,
        items: Array.from(solutions)
          .slice(0, 3)
          .map(({ complexity, path }) => ({ complexity, path: path as Path })),
        effectiveDifficulty: difficultiesMap.get(level.id) ?? 0,
        evaluatedDifficulty: level.difficulty,
      };
    }
  );
}
