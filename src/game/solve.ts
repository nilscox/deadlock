import { Direction, directions } from './direction';
import { Level } from './level';
import { Player } from './player';

type Path = Direction[];

export const solve = (level: Level, max = Infinity) => {
  const path: Path = [];
  const solutions = new Array<Path>();
  const player = new Player(level);

  const run = () => {
    for (const dir of directions) {
      if (!player.move(dir)) {
        continue;
      }

      path.push(dir);

      if (level.emptyCells.length === 1) {
        solutions.push([...path]);
        if (solutions.length > max) {
          return [];
        }
      } else {
        run();
      }

      path.pop();
      player.back();
    }
  };

  run();

  return solutions;
};
