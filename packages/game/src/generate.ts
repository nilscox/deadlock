import { CellType, Level, LevelDefinition } from './level';

export const nextLevel = (cells: CellType[], slice = cells.length): number => {
  const lastBlockIdx = cells.slice(0, slice).lastIndexOf(CellType.block);

  if (lastBlockIdx === -1) {
    return -1;
  }

  if (lastBlockIdx === slice - 1) {
    const idx = nextLevel(cells, slice - 1);

    if (idx === -1) {
      return -1;
    }

    if (cells[idx + 1]) {
      cells[lastBlockIdx] = CellType.empty;
      cells[idx + 1] = CellType.block;
    }
  } else {
    cells[lastBlockIdx] = CellType.empty;
    cells[lastBlockIdx + 1] = CellType.block;
  }

  return lastBlockIdx + 1;
};

export const generateAllLevels = (
  width: number,
  height: number,
  blocks: number,
  limit = Infinity,
  startHash?: string
): LevelDefinition[] => {
  const cells = Array(width * height).fill(CellType.empty);
  const levels: LevelDefinition[] = [];

  if (startHash) {
    const level = Level.fromHash(Level.fromHash(startHash).fingerprint);

    for (const cell of level.cells(CellType.block)) {
      cells[cell.x + cell.y * width] = CellType.block;
    }
  } else {
    for (let i = 0; i < blocks; ++i) {
      cells[i] = CellType.block;
    }
  }

  do {
    const blocks = Array(cells.length)
      .fill(null)
      .map((_, i) => ({ x: i % width, y: Math.floor(i / width) }))
      .filter((_, i) => cells[i] === CellType.block);

    for (let i = 0; i < cells.length; ++i) {
      if (cells[i] !== CellType.empty) {
        continue;
      }

      const definition: LevelDefinition = {
        width,
        height,
        start: { x: i % width, y: Math.floor(i / width) },
        blocks,
      };

      const hash = Level.computeHash(definition);
      const fp = Level.computeFingerprint(definition);

      if (hash !== fp) {
        continue;
      }

      levels.push(definition);
    }
  } while (nextLevel(cells) !== -1 && levels.length < limit);

  return levels;
};
