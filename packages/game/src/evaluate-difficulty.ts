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

    if (changedDirection(level, player, prevDir, dir)) {
      difficulty += 3;
    }

    if (isOnlyOption(level, player, dir)) {
      difficulty -= 1;
    }

    if (didJump(level, player, dir)) {
      difficulty += 1;
    }

    level.movePlayer(player, dir);
  }

  level.restart();

  return difficulty;
};

const changedDirection = (level: Level, player: Player, prevDir: Direction, dir: Direction) => {
  if (!prevDir || dir == prevDir) {
    return false;
  }

  if (level.movePlayer(player, prevDir)) {
    level.movePlayerBack(player);
    return true;
  }

  return false;
};

const isOnlyOption = (level: Level, player: Player, dir: Direction) => {
  for (const d of directions) {
    if (d !== dir) {
      continue;
    }

    if (level.movePlayer(player, d)) {
      level.movePlayerBack(player);
      return false;
    }
  }

  return true;
};

const didJump = (level: Level, player: Player, dir: Direction) => {
  const last = player.position;

  level.movePlayer(player, dir);
  level.movePlayerBack(player);

  const [dx, dy] = [abs(last.x - player.position.x), abs(last.y - player.position.y)];

  return dx + dy > 1;
};
