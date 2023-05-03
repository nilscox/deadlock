import { Cell, Level } from './level';
import { CellType, LevelDescription } from './types';
import { randomId } from './utils';

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

export type GenerateLevelsOptions = {
  count: number;
  onProgress: (result: LevelDescription) => void;
};

export const generateLevels = async (opts: GenerateLevelsOptions) => {
  const results: Record<string, LevelDescription> = {};

  while (Object.keys(results).length < opts.count) {
    const level = await generateLevel();

    results[randomId()] = level;
    opts.onProgress(level);
  }

  return results;
};
