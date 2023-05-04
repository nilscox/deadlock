import { Path, directions } from './direction';
import { Level, LevelDescription } from './level';
import { Player } from './player';

export const solve = (desc: LevelDescription, max = Infinity) => {
  const path: Path = [];
  const solutions = new Array<Path>();
  const level = new Level(desc);
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

  if (!run()) {
    return false;
  }

  return solutions;
};
