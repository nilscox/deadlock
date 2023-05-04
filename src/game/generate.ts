import { Cell, CellType } from './cell';
import { computeLevelsDifficulties } from './evaluate-difficulty';
import { Level, LevelDescription } from './level';
import { randomTransformLevel } from './level-transforms';
import { Point } from './point';
import { shuffle } from './utils';

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

export const generateAllLevels = (width: number, height: number, blocks: number): LevelDescription[] => {
  const level = emptyLevel(width, height);
  const levels: LevelDescription[] = [];

  for (let i = 0; i < blocks; ++i) {
    level.cells()[i].type = CellType.block;
  }

  do {
    for (const cell of level.cells()) {
      if (cell.type === CellType.block) {
        continue;
      }

      const { x, y } = level.playerPosition as Point;
      level.setPlayerPosition(cell.x, cell.y);
      level.at(x, y).type = CellType.empty;

      levels.push(level.serialize());
    }
  } while (nextLevel(level.cells()) !== -1);

  return levels;
};

export const generateLevels = (width: number, height: number, blocks: number) => {
  let levels = shuffle(generateAllLevels(width, height, blocks));
  const difficulty = computeLevelsDifficulties(levels);

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
