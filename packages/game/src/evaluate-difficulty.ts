import { CellType, Level, LevelDefinition } from './level';
import { Player } from './player';
import { solve } from './solve';
import { Direction, Path, getDirectionVector } from './utils/direction';
import { abs, min } from './utils/math';

export const computeLevelsDifficulties = (levels: Array<Level | LevelDefinition>) => {
  const difficulties = new Map(
    levels.map((level, i) => {
      const difficulty = evaluateLevelDifficulty(level);

      console.log(`${i} / ${levels.length} (${Math.floor((100 * i) / levels.length)}%)`);

      return [level, difficulty];
    })
  );

  return (level: Level | LevelDefinition) => {
    return difficulties.get(level)?.difficulty ?? -1;
  };
};

export const evaluateLevelDifficulty = (input: Level | LevelDefinition, solutionsInput?: Path[]) => {
  const level = input instanceof Level ? input : new Level(input);
  const solutions = solutionsInput ?? solve(level);

  if (!solutions || solutions.length === 0) {
    return { difficulty: Infinity };
  }

  const solutionsComplexities = new Map(
    solutions.map((solution) => [solution, evaluateSolutionComplexity(level, solution)])
  );

  const numberOfSolutionsScore = Math.floor(Math.max(0, 7 - Math.log2(solutions.length)));
  const easiestSolutionScore = min(Array.from(solutionsComplexities.values()));

  return {
    difficulty: numberOfSolutionsScore + easiestSolutionScore,
    numberOfSolutions: solutions.length,
    numberOfSolutionsScore,
    easiestSolutionScore,
    solutionsComplexities,
  };
};

export const evaluateSolutionComplexity = (level: Level, solution: Direction[]) => {
  const player = new Player(level.start);
  let prevDir: Direction | undefined;
  let difficulty = 0;

  for (const dir of solution) {
    if (prevDir && dir !== prevDir) {
      const [dx, dy] = getDirectionVector(prevDir);
      const { x, y } = player.position;

      if (level.atUnsafe(x + dx, y + dy) === CellType.empty) {
        difficulty += 4;
      }
    }

    prevDir = dir;

    const last = player.position;

    level.movePlayer(player, dir);

    const [dx, dy] = [abs(last.x - player.position.x), abs(last.y - player.position.y)];

    if (dx + dy > 2) {
      difficulty += 2;
    }
  }

  level.restart();

  return difficulty;
};
