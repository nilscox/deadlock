import { Cell, CellType } from './cell';
import { Direction, getDirectionVector } from './direction';
import { Level, LevelDescription } from './level';
import { solve } from './solve';
import { randBool, shuffle } from './utils';

const emptyLevel = (width: number, height: number): Level => {
  const desc = Array(width * height)
    .fill(null)
    .map((_, i) => ({
      x: Math.floor(i / height),
      y: i % height,
      type: CellType.empty,
    }));

  desc[0].type = CellType.player;

  return new Level(desc);
};

const last = <T>(array: T[]) => {
  return array[array.length - 1];
};

const nextLevel = (cells: Cell[]) => {
  const lastBlockIdx = cells.findLastIndex((cell) => cell.type === CellType.block);

  if (lastBlockIdx === -1) {
    return -1;
  }

  if (cells[lastBlockIdx] === last(cells)) {
    const idx = nextLevel(cells.slice(0, -1));

    if (idx === -1 || !cells[idx + 2]) {
      return -1;
    }

    cells[lastBlockIdx].type = CellType.empty;
    cells[idx + 2].type = CellType.block;
  } else {
    cells[lastBlockIdx].type = CellType.empty;
    cells[lastBlockIdx + 1].type = CellType.block;
  }

  return lastBlockIdx;
};

export const generateAllLevels = (width: number, height: number, blocks: number): LevelDescription[] => {
  const level = emptyLevel(width, height);
  const levels: LevelDescription[] = [];

  const cells = level.emptyCells;

  for (let i = 0; i < blocks; ++i) {
    cells[i].type = CellType.block;
  }

  do {
    for (const cell of level.emptyCells) {
      level.setStart(cell);
      levels.push(level.serialize());
    }
  } while (nextLevel(level.cellsArray) !== -1);

  return levels;
};

const isLevelRelevant = (level: LevelDescription) => {
  const solutions = solve(new Level(level), 10);

  if (solutions.length === 0) {
    return false;
  }

  for (const solution of solutions) {
    if (countJumps(solution) < 1) {
      return false;
    }
  }

  return true;
};

const countJumps = (solution: Direction[]) => {
  const cells = new Set<string>();
  const jumps = new Set<string>();

  let x = 0;
  let y = 0;

  const key = (x: number, y: number) => `${x},${y}`;

  cells.add(key(x, y));

  for (const [index, dir] of Object.entries(solution)) {
    const [dx, dy] = getDirectionVector(dir);

    while (cells.has(key((x += dx), (y += dy)))) {
      jumps.add(index);
    }

    cells.add(key(x, y));
  }

  return jumps.size;
};

export const generateLevels = (width: number, height: number, blocks: number) => {
  const all = shuffle(generateAllLevels(width, height, blocks));

  const solvable = all.filter((level, i) => {
    console.log(`${i} / ${all.length} (${Math.floor((100 * i) / all.length)}%)`);
    return isLevelRelevant(level);
  });

  for (let i = 0; i < solvable.length; ++i) {
    const level = new Level(solvable[i]);

    for (const cell of level.edgeCells) {
      if (cell.type === CellType.block && randBool(0.7)) {
        level.removeCell(cell);
      }
    }

    solvable[i] = level.serialize();
  }

  return solvable;
};
