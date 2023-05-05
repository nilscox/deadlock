import { Cell, CellType } from './cell';
import { computeLevelsDifficulties } from './evaluate-difficulty';
import { Level } from './level';
import { randomTransformLevel } from './level-transforms';
import { boundaries, shuffle } from './utils';

const emptyLevel = (width: number, height: number): Level => {
  const level = new Level();

  for (let j = 0; j < height; ++j) {
    for (let i = 0; i < width; ++i) {
      level.addCell(i, j, CellType.empty);
    }
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

export const generateAllLevels = (width: number, height: number, blocks: number): Level[] => {
  const level = emptyLevel(width, height);
  const levels: Level[] = [];

  for (let i = 0; i < blocks; ++i) {
    level.cells()[i].type = CellType.block;
  }

  do {
    for (const cell of level.cells(CellType.empty)) {
      level.at(cell.x, cell.y).type = CellType.player;
      levels.push(level.clone());
      level.at(cell.x, cell.y).type = CellType.empty;
    }
  } while (nextLevel(level.cells()) !== -1);

  return levels;
};

export const generateLevels = (width: number, height: number, blocks: number, slice?: number) => {
  const levels = new Set(shuffle(generateAllLevels(width, height, blocks)).slice(0, slice));

  for (const level of levels) {
    while (level.edgeCells.find((cell) => cell.type === CellType.block)) {
      for (const cell of level.edgeCells) {
        if (cell.type === CellType.block) {
          level.removeCell(cell);
        }
      }
    }

    const { min, max } = boundaries(level.cells());

    if (max.x - min.x + 1 !== width || max.y - min.y + 1 !== height) {
      levels.delete(level);
      continue;
    }

    randomTransformLevel(level);
  }

  const difficulty = computeLevelsDifficulties(Array.from(levels));

  for (const level of levels) {
    if (difficulty(level) < 0) {
      levels.delete(level);
    }
  }

  return Array.from(levels).sort((a, b) => difficulty(a) - difficulty(b));
};
