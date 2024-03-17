import { evaluateLevelDifficulty } from './evaluate-difficulty';
import { CellType, Level, LevelDefinition } from './level';
import { Player } from './player';
import { solve } from './solve';
import { Path, directions } from './utils/direction';
import { randItem, randItems } from './utils/math';
import { IPoint } from './utils/point';
import { array } from './utils/utils';

export type GenerateLevelsOptions = {
  count: number;
  width: number;
  height: number;
  nbBlocks: number;
  maxSolutions: number;
  minDifficulty: number;
  teleports: boolean;
};

export async function generateLevels(
  options: GenerateLevelsOptions,
  onProgress: (total: number, index: number) => void | Promise<void>,
  onGenerated: (level: LevelDefinition) => void | Promise<void>
) {
  for (let i = 0; i < options.count; ++i) {
    let level: Level | undefined = undefined;
    let tries = 0;

    while (!level && tries < 10000) {
      tries++;
      level = generateLevel(options);
    }

    if (!level) {
      throw new Error('Cannot generate level');
    }

    await onProgress(options.count, i);
    await onGenerated(level.definition);
  }
}

function generateLevel({
  width,
  height,
  nbBlocks,
  maxSolutions,
  minDifficulty,
  teleports,
}: GenerateLevelsOptions) {
  const solution: Path = [];

  const cells: IPoint[] = array(height, (y) => array(width, (x) => ({ x, y }))).flat();
  const [start, teleportStart, teleportEnd] = randItems(cells, 3);

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
      return;
    }

    level.movePlayer(player, direction);
    solution.push(direction);
  }

  const blocks = level.map.cells(CellType.empty);

  level.restart();

  level.load({
    ...level.definition,
    blocks,
  });

  if (isBad(level)) {
    return;
  }

  const solutions = solve(level, maxSolutions);
  if (!solutions || solution?.length > maxSolutions) {
    return;
  }

  const difficulty = evaluateLevelDifficulty(level.definition);

  if (difficulty < minDifficulty) {
    return;
  }

  return level;
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
  for (const { x, y } of level.map.cells(CellType.teleport)) {
    if (!level.map.neighbors(x, y).find((cell) => cell.type === CellType.empty)) {
      return true;
    }

    if (level.map.neighbors(x, y).find((cell) => cell.type === CellType.teleport)) {
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

    if (level.map.at(player.position.move(options[0])) === CellType.teleport) {
      return true;
    }

    level.movePlayer(player, options[0]);
    moves += 1;
  }

  level.restart();

  if (moves === 3) {
    return true;
  }

  return false;
}
