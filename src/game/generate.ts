import { Direction, getDirectionVector } from './direction';
import { Level } from './level';
import { Player } from './player';
import { CellType, LevelDescription } from './types';
import { Tick, randBool, randInt, randItem, randItems, randomId, shuffle, timeout } from './utils';

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

type GenerateLevelOptions = {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  minBlocks: number;
  maxBlocks: number;
  removeEdgesProbability: number;
  minEdgesToRemove: number;
  maxEdgesToRemove: number;
  addEdgesProbability: number;
  minEdgesToAdd: number;
  maxEdgesToAdd: number;
};

export const generateLevel = (opts: GenerateLevelOptions): Level => {
  const width = randInt(opts.minWidth, opts.maxWidth);
  const height = randInt(opts.minHeight, opts.maxHeight);

  const level = emptyLevel(width, height);

  for (const cell of randItems(level.emptyCells, randInt(opts.minBlocks, opts.maxBlocks))) {
    cell.type = CellType.block;
  }

  if (randBool(opts.removeEdgesProbability)) {
    for (const cell of randItems(level.edgeCells, randInt(opts.minEdgesToRemove, opts.maxEdgesToRemove))) {
      level.removeCell(cell);
    }
  }

  if (randBool(opts.addEdgesProbability)) {
    for (const cell of randItems(level.edgeCells, randInt(opts.minEdgesToAdd, opts.maxEdgesToAdd))) {
      outer: for (const direction of shuffle(Object.values(Direction))) {
        const [dx, dy] = getDirectionVector(direction);

        const [x, y] = [cell.x + dx, cell.y + dy];

        if (!level.at(x, y)) {
          level.addCell(x, y, CellType.empty);
          break outer;
        }
      }
    }
  }

  level.setStart(randItem(level.emptyCells));

  return level;
};

type Path = Direction[];

const solve = async (tick: Tick, level: Level, max: number) => {
  const path: Path = [];
  const solutions = new Array<Path>();
  const player = new Player(level);

  const run = async () => {
    for (const dir of Object.values(Direction)) {
      await tick();

      if (!player.move(dir)) {
        continue;
      }

      path.push(dir);

      if (level.emptyCells.length === 1) {
        solutions.push([...path]);

        if (solutions.length >= max) {
          return;
        }
      } else {
        await run();
      }

      path.pop();
      player.back();
    }
  };

  await run();

  if (solutions.length === 0 || solutions.length >= max) {
    return;
  }

  return solutions;
};

type GenerateSolvableLevelOptions = GenerateLevelOptions & {
  maxSolutions: number;
};

export const generateSolvableLevel = async (
  opts: GenerateSolvableLevelOptions
): Promise<LevelDescription> => {
  const level = generateLevel(opts);

  const solutions = await timeout((tick) => solve(tick, level, opts.maxSolutions), 60000);

  if (!solutions) {
    return generateSolvableLevel(opts);
  }

  return level.serialize();
};

export type GenerateLevelsOptions = GenerateSolvableLevelOptions & {
  count: number;
  onProgress: (results: number) => void;
};

export const generateLevels = async (opts: GenerateLevelsOptions) => {
  const results: Record<string, LevelDescription> = {};

  while (Object.keys(results).length < opts.count) {
    const level = await generateSolvableLevel(opts);

    results[randomId()] = level;
    opts.onProgress(Object.keys(results).length);
  }

  return results;
};
