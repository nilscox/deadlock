import { Direction } from './direction';
import { Level } from './level';
import { Player } from './player';
import { CellType, LevelDescription } from './types';
import { Tick, randBool, randInt, randItem, randItems, timeout } from './utils';

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

type SolvedLevel = {
  level: LevelDescription;
  solutions: Path[];
};

type GenerateSolvableLevelOptions = GenerateLevelOptions & {
  maxSolutions: number;
};

export const generateSolvableLevel = async (
  tick: Tick,
  opts: GenerateSolvableLevelOptions
): Promise<SolvedLevel | undefined> => {
  const level = generateLevel(opts);

  const solutions = await solve(tick, level, opts.maxSolutions);

  if (!solutions) {
    return generateSolvableLevel(tick, opts);
  }

  return {
    level: level.serialize(),
    solutions,
  };
};

export type GenerateLevelsOptions = GenerateSolvableLevelOptions & {
  count: number;
  solveTimeout: number;
  onProgress: (results: number) => void;
};

export const generateLevels = async (opts: GenerateLevelsOptions) => {
  const results: Array<SolvedLevel> = [];

  while (results.length < opts.count) {
    const result = await timeout((tick) => generateSolvableLevel(tick, opts), opts.solveTimeout);

    if (!result) {
      continue;
    }

    results.push(result);
    opts.onProgress(results.length);
  }

  return results;
};
