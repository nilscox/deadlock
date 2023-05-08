import { CellType, Level, LevelDefinition } from './level';
import { ReflectionTransform, RotationTransform } from './level-transforms';
import { solve } from './solve';
import { Path } from './utils/direction';
import { randBool, randInt, randItem } from './utils/math';
import { array, identity } from './utils/utils';

export type GenerateLevelsOptions = {
  width: number;
  height: number;
  blocks: number;
  limit?: number;
  startHash?: string;
  maxSolutions?: number;
  singleStartPosition?: boolean;
  nextLevel?: NextLevel;
};

export const generateLevels = async (
  options: GenerateLevelsOptions,
  onProgress: (total: number, index: number, solutions: boolean) => void | Promise<void>,
  onGenerated: (level: LevelDefinition, solutions: Path[]) => void | Promise<void>
) => {
  const levels = generateAllLevels(options);

  for (const level of levels) {
    const paths = solve(level, options.maxSolutions);
    const hasSolutions = Boolean(paths?.length);

    if (level.blocks.length !== options.blocks) {
      throw Level.computeFingerprint(level);
    }

    await onProgress(levels.length, levels.indexOf(level), hasSolutions);

    if (!hasSolutions) {
      continue;
    }

    if (randBool()) ReflectionTransform.horizontal(level);
    if (randBool()) ReflectionTransform.vertical(level);

    const angle = randInt(0, 4);
    if (angle === 1) RotationTransform.quarter(level);
    if (angle === 2) RotationTransform.half(level);
    if (angle === 3) RotationTransform.threeQuarters(level);

    await onGenerated(level, paths as Path[]);
  }
};

const generateAllLevels = (options: GenerateLevelsOptions): LevelDefinition[] => {
  const {
    width,
    height,
    blocks,
    limit = Infinity,
    startHash,
    singleStartPosition,
    nextLevel: next = nextLevel,
  } = options;

  const cells: CellType[] = Array(width * height).fill(CellType.empty);
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

    const generate = (start: { x: number; y: number }) => {
      const definition: LevelDefinition = {
        width,
        height,
        start,
        blocks,
      };

      const hash = Level.computeHash(definition);
      const fp = Level.computeFingerprint(definition);

      if (hash !== fp) {
        return;
      }

      levels.push(definition);
    };

    if (singleStartPosition) {
      const i = randItem(array(cells.length, identity).filter((i) => cells[i] === CellType.empty));

      generate({
        x: i % width,
        y: Math.floor(i / width),
      });
    } else {
      for (let i = 0; i < cells.length; ++i) {
        if (cells[i] !== CellType.empty) {
          continue;
        }

        generate({
          x: i % width,
          y: Math.floor(i / width),
        });
      }
    }
  } while (next(cells) !== -1 && levels.length < limit);

  return levels.slice(0, limit);
};

type NextLevel = (cells: CellType[]) => number | unknown;

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
