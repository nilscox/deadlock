import { Level, type LevelDefinition } from './level.js';
import { Player } from './player.js';
import { solve } from './solve.js';
import { defined } from './utils/assert.js';
import { Direction, type Path, directions, getOppositeDirection } from './utils/direction.js';
import { clamp, sum } from './utils/math.js';

export function evaluateLevelDifficulty(def: LevelDefinition) {
  return getLevelDifficultyDetails(def)?.total ?? Infinity;
}

export function getLevelDifficultyDetails(def: LevelDefinition) {
  const level = Level.load(def);
  const solutions = solve(level);

  if (!solutions) {
    return null;
  }

  const solutionsScores = solutions
    .map((path) => getPathScore(level, path))
    .sort((a, b) => a.total - b.total);

  const easiestSolutionScores = defined(solutionsScores[0]);

  const numberOfSolutions = solutions.length;
  const numberOfSolutionsScore = getNumberOfSolutionsScore(numberOfSolutions);

  return {
    numberOfSolutions,
    numberOfSolutionsScore,
    ...easiestSolutionScores,
    total: clamp(1, 6, numberOfSolutionsScore + easiestSolutionScores.total),
  };
}

function getNumberOfSolutionsScore(numberOfSolutions: number): number {
  if (numberOfSolutions < 5) {
    return 1;
  }

  return 0;
}

function getPathScore(level: Level, path: Path) {
  const player = new Player(level.start);
  let jumps = 0;
  let opposite = 0;
  let options = 0;
  let last: Direction | undefined = undefined;

  for (const dir of path) {
    let hasOptions = false;

    for (const d of directions.filter((d) => d !== dir)) {
      if (level.movePlayer(player, d)) {
        options++;
        hasOptions = true;
        level.movePlayerBack(player);
      }
    }

    const prev = player.position;
    level.movePlayer(player, dir);
    const next = player.position;

    if (!prev.move(dir).equals(next)) {
      jumps++;
    }

    if (hasOptions && last && getOppositeDirection(last) === dir) {
      opposite++;
    }

    last = dir;
  }

  level.restart();

  const scores = {
    jumpsScore: 0,
    oppositeScore: 0,
    optionsScore: 0,
  };

  if (jumps === 0) {
    scores.jumpsScore = -1;
  }

  if (jumps >= 2) {
    scores.jumpsScore = 1;
  }

  if (jumps >= 4) {
    scores.jumpsScore = 2;
  }

  if (opposite > 0) {
    scores.oppositeScore = 2;
  }

  if (options >= 10) {
    scores.optionsScore = 1;
  }

  if (options < 3) {
    scores.optionsScore = -1;
  }

  return {
    jumps,
    opposite,
    options,
    ...scores,
    total: sum(Object.values(scores)),
  };
}
