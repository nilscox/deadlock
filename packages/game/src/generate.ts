import { evaluateLevelDifficulty } from './evaluate-difficulty.ts';
import { Level, type LevelDefinition } from './level.ts';
import { Player } from './player.ts';
import { solve } from './solve.ts';
import { defined } from './utils/assert.ts';
import { type Path, directions } from './utils/direction.ts';
import { randItem, randItems } from './utils/math.ts';
import { type IPoint } from './utils/point.ts';
import { array } from './utils/utils.ts';

export type GenerateLevelOptions = {
  width: number;
  height: number;
  nbBlocks: number;
  maxSolutions: number;
  minDifficulty: number;
  teleports: boolean;
};

export function generateLevel(options: GenerateLevelOptions): LevelDefinition {
  const { width, height, nbBlocks, maxSolutions, minDifficulty, teleports } = options;
  const solution: Path = [];

  const cells: IPoint[] = array(height, (y) => array(width, (x) => ({ x, y }))).flat();
  const [start, teleportStart, teleportEnd] = randItems(cells, 3) as [IPoint, IPoint, IPoint];

  const level = Level.load({
    width,
    height,
    start,
    blocks: [],
    teleports: teleports ? [teleportStart, teleportEnd] : [],
  });

  const player = new Player(level.start);

  while (solution.length < cells.length - nbBlocks - 2) {
    const direction = randItem(availableDirections(level, player));

    if (direction === undefined) {
      return generateLevel(options);
    }

    level.movePlayer(player, direction);
    solution.push(direction);
  }

  const blocks = level.map.cells('empty');

  level.restart();

  level.load({
    ...level.definition,
    blocks,
  });

  if (isBad(level)) {
    return generateLevel(options);
  }

  const solutions = solve(level, maxSolutions);

  if (!solutions || solution.length > maxSolutions) {
    return generateLevel(options);
  }

  const difficulty = evaluateLevelDifficulty(level.definition);

  if (difficulty < minDifficulty) {
    return generateLevel(options);
  }

  return level.definition;
}

function availableDirections(level: Level, player: Player) {
  return directions.filter((dir) => {
    const canMove = level.movePlayer(player, dir);

    if (canMove) {
      level.movePlayerBack(player);
    }

    return canMove;
  });
}

function isBad(level: Level) {
  for (const { x, y } of level.map.cells('teleport')) {
    if (!level.map.neighbors(x, y).find((cell) => cell.type === 'empty')) {
      return true;
    }

    if (level.map.neighbors(x, y).find((cell) => cell.type === 'teleport')) {
      return true;
    }
  }

  const player = new Player(level.start);
  let moves = 0;

  while (moves < 3) {
    const options = directions.filter((dir) => {
      const canMove = level.movePlayer(player, dir);

      if (canMove) {
        level.movePlayerBack(player);
      }

      return canMove;
    });

    if (options.length > 1) {
      break;
    }

    const option = defined(options[0]);

    if (level.map.at(player.position.move(option)) === 'teleport') {
      return true;
    }

    level.movePlayer(player, option);
    moves += 1;
  }

  level.restart();

  if (moves === 3) {
    return true;
  }

  return false;
}
