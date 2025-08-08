import { getWinningPaths, graph } from './graph';
import { Level, type LevelDefinition } from './level';
import { Player } from './player';
import { defined } from './utils/assert';
import { Direction, type Path, directions } from './utils/direction';

export const solve = (lvl: Level | LevelDefinition, max = Infinity) => {
  const level = lvl instanceof Level ? lvl : Level.load(lvl);
  const player = new Player(level.start);

  const path: Path = [];
  const solutions = new Array<Path>();

  const run = () => {
    for (const dir of directions) {
      if (!level.movePlayer(player, dir)) {
        continue;
      }

      path.push(dir);

      if (level.isCompleted()) {
        solutions.push([...path]);

        if (solutions.length > max) {
          return false;
        }
      } else {
        if (!run()) {
          return false;
        }
      }

      path.pop();
      level.movePlayerBack(player);
    }

    return true;
  };

  if (!run()) {
    return;
  }

  return solutions;
};

export function solveGraph(lvl: Level | LevelDefinition, max = Infinity): Path[] | null {
  const level = lvl instanceof Level ? lvl : Level.load(lvl);
  const node = graph(level);
  const paths = getWinningPaths(node);

  if (paths.length > max) {
    return null;
  }

  return paths.map((path) => {
    const solution: Path = [];

    for (let i = 0; i < path.length - 1; ++i) {
      const parent = defined(path[i]);
      const child = defined(path[i + 1]);

      const childIndex = Object.values(parent.children).indexOf(child);
      const direction = Object.keys(parent.children)[childIndex];

      solution.push(direction as Direction);
    }

    return solution;
  });
}
