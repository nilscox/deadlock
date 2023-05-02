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

export const generateLevel = (): Level => {
  const level = emptyLevel(randInt(3, 7), randInt(3, 7));

  if (randBool()) {
    for (const cell of randItems(level.edgeCells, randInt(1, 4))) {
      level.removeCell(cell);
    }
  }

  for (const cell of randItems(level.emptyCells, randInt(0, 5))) {
    cell.type = CellType.block;
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

export const generateSolvableLevel = async (tick: Tick): Promise<SolvedLevel | undefined> => {
  const level = generateLevel();

  const solutions = await solve(tick, level, 100);

  if (!solutions) {
    return generateSolvableLevel(tick);
  }

  return {
    level: level.serialize(),
    solutions,
  };
};

export const generateLevels = async () => {
  const results: Array<SolvedLevel> = [];

  while (results.length < 30) {
    const result = await timeout(generateSolvableLevel, 15000);

    if (!result) {
      continue;
    }

    results.push(result);
    console.log(results.length);
  }

  return results;
};
