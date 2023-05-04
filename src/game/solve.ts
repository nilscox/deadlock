import { Path, directions } from './direction';
import { Level } from './level';
import { Player } from './player';

export const solve = (level: Level, max = Infinity) => {
  const player = new Player(level);

  level.bindPlayerEvents(player);

  const path: Path = [];
  const solutions = new Array<Path>();

  const run = () => {
    for (const dir of directions) {
      if (!player.move(dir)) {
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
      player.back();
    }

    return true;
  };

  try {
    if (!run()) {
      return false;
    }

    return solutions;
  } finally {
    level.releasePlayerEvents();
  }
};
