import { Level } from './level';
import { Player } from './player';
import { Path, directions } from './utils/direction';

export const solve = (level: Level, max = Infinity) => {
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
      player.moveBack();
    }

    return true;
  };

  if (!run()) {
    return false;
  }

  return solutions;
};
