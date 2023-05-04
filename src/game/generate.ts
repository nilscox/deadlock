import { Cell, CellType } from './cell';
import { Direction, getDirectionVector } from './direction';
import { Level, LevelDescription } from './level';
import { randomTransformLevel } from './level-transforms';
import { solve } from './solve';
import { shuffle } from './utils';

const emptyLevel = (width: number, height: number): Level => {
  const level = new Level();

  for (let i = 0; i < width * height; ++i) {
    level.addCell(Math.floor(i / height), i % height, CellType.empty);
  }

  return level;
};

const last = <T>(array: T[]) => {
  return array[array.length - 1];
};

const nextLevel = (cells: Cell[]): number => {
  const lastBlockIdx = cells.findLastIndex((cell) => cell.type === CellType.block);

  if (lastBlockIdx === -1) {
    return -1;
  }

  if (cells[lastBlockIdx] === last(cells)) {
    const idx = nextLevel(cells.slice(0, -1));

    if (idx === -1) {
      return -1;
    }

    if (cells[idx + 1]) {
      cells[lastBlockIdx].type = CellType.empty;
      cells[idx + 1].type = CellType.block;
    }
  } else {
    cells[lastBlockIdx].type = CellType.empty;
    cells[lastBlockIdx + 1].type = CellType.block;
  }

  return lastBlockIdx + 1;
};

export const generateAllLevels = (width: number, height: number, blocks: number): LevelDescription[] => {
  const level = emptyLevel(width, height);
  const levels: LevelDescription[] = [];

  for (let i = 0; i < blocks; ++i) {
    level.cellsArray[i].type = CellType.block;
  }

  do {
    for (const cell of level.emptyCells) {
      level.setStart(cell);
      levels.push(level.serialize());
    }
  } while (nextLevel(level.cellsArray) !== -1);

  return levels;
};

export const evaluateLevelDifficulty = (level: LevelDescription) => {
  const solutions = solve(level);

  if (!solutions || solutions.length === 0) {
    return -1;
  }

  const numberOfSolutionsScore = Math.max(0, 10 - Math.floor(Math.log2(solutions.length)));
  const simplestSolutionScore = solutions.map(evaluateSolutionSimplicity).sort((a, b) => a - b)[0];

  return numberOfSolutionsScore + 3 * simplestSolutionScore;
};

const evaluateSolutionSimplicity = (solution: Direction[]) => {
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

export const generateLevels = (width: number, height: number, blocks: number) => {
  let levels = shuffle(generateAllLevels(width, height, blocks));

  const difficulties = new Map(
    levels.map((level, i) => {
      console.log(`${i} / ${levels.length} (${Math.floor((100 * i) / levels.length)}%)`);
      return [level, evaluateLevelDifficulty(level)];
    })
  );

  const difficulty = (level: LevelDescription) => {
    return difficulties.get(level) ?? 0;
  };

  levels = levels.filter((level) => difficulty(level) >= 0);
  levels.sort((a, b) => difficulty(a) - difficulty(b));

  for (let i = 0; i < levels.length; ++i) {
    const level = new Level(levels[i]);

    for (const cell of level.edgeCells) {
      if (cell.type === CellType.block) {
        level.removeCell(cell);
      }
    }

    randomTransformLevel(level);
    levels[i] = level.serialize();
  }

  return levels;
};
