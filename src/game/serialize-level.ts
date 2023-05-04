import { Cell, CellDescription, CellType } from './cell';
import { Level, LevelDescription } from './level';
import { IPoint, Point } from './point';
import { assert } from './utils';

export const loadLevel = (level: Level, desc: LevelDescription): void => {
  let start: IPoint | undefined;

  desc.forEach(([x, y, t]) => {
    let type = mapCellDescriptionToType(t);

    if (type === CellType.player) {
      if (start !== undefined) {
        throw new Error('multiple start positions');
      }

      start = { x, y };
      type = CellType.empty;
    }

    level.addCell(x, y, type);
  });

  assert(start, 'missing start position');
  level.start = new Point(start);
};

const mapCellDescriptionToType = (type: CellDescription[2]) => {
  if (type === undefined) return CellType.empty;
  if (type === 0) return CellType.block;
  if (type === 1) return CellType.player;
  throw new Error(`Invalid cell type ${type}`);
};

export const serializeLevel = (level: Level): LevelDescription => {
  return level.cellsArray.map((cell: Cell): CellDescription => {
    if (cell.type === undefined) {
      return [cell.x, cell.y];
    }

    return [cell.x, cell.y, level.start.equals(cell) ? 1 : 0];
  });
};
