import { Level, LevelDefinition } from './level';
import { Player } from './player';
import { Direction, Path, directions } from './utils/direction';
import { abs, max, min, round } from './utils/math';

export const evaluateLevelDifficulty = (input: Level | LevelDefinition, solutions: Path[]) => {
  const level = input instanceof Level ? input : new Level(input);

  if (!solutions || solutions.length === 0) {
    return { difficulty: Infinity };
  }

  const solutionsComplexities = new Map(
    solutions.map((solution) => [solution, evaluateSolutionComplexity(level, solution)])
  );

  const nbCells = level.definition.width * level.definition.height;
  const numberOfSolutionsScore = round(max([0, 7 - Math.log2(solutions.length)]), 2);
  const easiestSolutionScore = round(min(Array.from(solutionsComplexities.values())) / Math.sqrt(nbCells), 2);
  const difficulty = round(numberOfSolutionsScore + easiestSolutionScore, 2);

  return {
    difficulty,
    numberOfSolutions: solutions.length,
    numberOfSolutionsScore,
    easiestSolutionScore,
    solutionsComplexities,
  };
};

export const evaluateSolutionComplexity = (level: Level, solution: Direction[]) => {
  const player = new Player(level.start);
  let difficulty = 0;

  for (let i = 0; i < solution.length; ++i) {
    const prevDir = solution[i - 1];
    const dir = solution[i];

    if (prevDir && dir !== prevDir) {
      if (level.movePlayer(player, prevDir)) {
        level.movePlayerBack(player);
        difficulty += 5;
      }
    }

    for (const d of directions) {
      if (d === dir) {
        continue;
      }

      if (level.movePlayer(player, d)) {
        level.movePlayerBack(player);
        difficulty += 1;
      }
    }

    const last = player.position;

    level.movePlayer(player, dir);

    const [dx, dy] = [abs(last.x - player.position.x), abs(last.y - player.position.y)];

    difficulty += dx + dy - 1;
  }

  level.restart();

  return difficulty;
};
