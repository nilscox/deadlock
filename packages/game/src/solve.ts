import { Level, LevelDefinition } from './level';
import { Player } from './player';
import { Path, directions } from './utils/direction';

export const solve = (lvl: Level | LevelDefinition, max = Infinity) => {
  const level = lvl instanceof Level ? lvl : new Level(lvl);
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
    return false;
  }

  return solutions;
};
