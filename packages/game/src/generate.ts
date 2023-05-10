import { CellType, Level, LevelDefinition } from './level';
import { ReflectionTransform, RotationTransform } from './level-transforms';
import { solve } from './solve';
import { Direction, Path, getOppositeDirection, isHorizontal, isVertical } from './utils/direction';
import { randBool, randInt, randItem } from './utils/math';
import { IPoint } from './utils/point';
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
  onProgress: (levels: LevelDefinition[], index: number, hasSolutions: boolean) => void | Promise<void>,
  onGenerated: (level: LevelDefinition, solutions: Path[]) => void | Promise<void>
) => {
  const levels = generateAllLevels(options);

  for (const level of levels) {
    const paths = solve(level, options.maxSolutions);
    const hasSolutions = Boolean(paths?.length);

    if (level.blocks.length !== options.blocks) {
      throw new Error(`invalid level generated: ${Level.computeFingerprint(level)}`);
    }

    await onProgress(levels, levels.indexOf(level), hasSolutions);

    if (!hasSolutions) {
      continue;
    }

    await onGenerated(...applyRandomTransformations(level, paths as Path[]));
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

  if (width > height) {
    return generateAllLevels({ ...options, width: height, height: width });
  }

  const cells: CellType[] = Array(width * height).fill(CellType.empty);
  const levels: LevelDefinition[] = [];

  if (startHash) {
    const level = Level.fromHash(Level.fromHash(startHash).fingerprint);

    for (const cell of level.cells(CellType.block)) {
      cells[pointToIndex(cell.x, cell.y, height)] = CellType.block;
    }

    for (const cell of level.cells(CellType.teleport)) {
      cells[pointToIndex(cell.x, cell.y, height)] = CellType.teleport;
    }
  } else {
    for (let i = 0; i < blocks; ++i) {
      cells[i] = CellType.block;
    }
  }

  do {
    const blocks = Array(cells.length)
      .fill(null)
      .map((_, i) => indexToPoint(i, height))
      .filter((_, i) => cells[i] === CellType.block);

    const teleports = Array(cells.length)
      .fill(null)
      .map((_, i) => indexToPoint(i, height))
      .filter((_, i) => cells[i] === CellType.teleport);

    const generate = (start: { x: number; y: number }) => {
      const definition: LevelDefinition = {
        width,
        height,
        start,
        blocks,
        teleports,
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

      generate(indexToPoint(i, height));
    } else {
      for (let i = 0; i < cells.length; ++i) {
        if (cells[i] !== CellType.empty) {
          continue;
        }

        generate(indexToPoint(i, height));
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

const pointToIndex = (x: number, y: number, height: number): number => {
  return x * height + y;
};

const indexToPoint = (index: number, height: number): IPoint => {
  return {
    x: Math.floor(index / height),
    y: index % height,
  };
};

const applyRandomTransformations = (
  definition: LevelDefinition,
  solutions: Path[]
): [LevelDefinition, Path[]] => {
  if (randBool(1)) {
    definition = ReflectionTransform.horizontal(definition);
    solutions = transformPaths(solutions, (dir) => (isHorizontal(dir) ? getOppositeDirection(dir) : dir));
  }

  if (randBool(0)) {
    definition = ReflectionTransform.vertical(definition);
    solutions = transformPaths(solutions, (dir) => (isVertical(dir) ? getOppositeDirection(dir) : dir));
  }

  const angle = randInt(1, 4);

  if (angle === 1) {
    definition = RotationTransform.quarter(definition);

    const cycle = [Direction.left, Direction.down, Direction.right, Direction.up];
    solutions = transformPaths(solutions, (dir) => cycle[(cycle.indexOf(dir) + 1) % 4]);
  }

  if (angle === 2) {
    definition = RotationTransform.half(definition);
    solutions = transformPaths(solutions, getOppositeDirection);
  }

  if (angle === 3) {
    definition = RotationTransform.threeQuarters(definition);

    const cycle = [Direction.left, Direction.up, Direction.right, Direction.down];
    solutions = transformPaths(solutions, (dir) => cycle[(cycle.indexOf(dir) + 1) % 4]);
  }

  return [definition, solutions];
};

const transformPaths = (paths: Path[], apply: (direction: Direction) => Direction): Path[] => {
  return paths.map((path) => path.map(apply));
};
