import { Direction, getDirectionVector } from './direction';
import { LevelDescription } from './level';
import { solve } from './solve';

export const evaluateLevelDifficulty = (level: LevelDescription) => {
  const solutions = solve(level);

  if (!solutions || solutions.length === 0) {
    return [-1];
  }

  const numberOfSolutionsScore = Math.max(0, 10 - Math.floor(Math.log2(solutions.length)));
  const simplestSolutionScore = solutions.map(evaluateSolutionSimplicity).sort((a, b) => a - b)[0];

  return [numberOfSolutionsScore, simplestSolutionScore];
};

export const evaluateSolutionSimplicity = (solution: Direction[]) => {
  const cells = new Set<string>();
  let total = 0;

  let x = 0;
  let y = 0;

  const key = (x: number, y: number) => `${x},${y}`;

  cells.add(key(x, y));

  for (const dir of solution) {
    const [dx, dy] = getDirectionVector(dir);

    let jumped = 0;

    while (cells.has(key((x += dx), (y += dy)))) {
      jumped++;
    }

    if (jumped) {
      total += jumped;
    }

    cells.add(key(x, y));
  }

  return total;
};
