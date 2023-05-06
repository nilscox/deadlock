import { Cell, CellDescription, CellType } from './cell';
import { Level, LevelDescription } from './level';
import { assert } from './utils';

export const loadLevel = (level: Level, desc: LevelDescription): void => {
  desc.forEach(([x, y, t]) => {
    const type = mapCellDescriptionToType(t);

    if (type === CellType.player) {
      if (level.playerPosition !== undefined) {
        throw new Error('multiple start positions');
      }
    }

    level.addCell(x, y, type);
  });

  assert(level.playerPosition, 'missing start position');
};

const mapCellDescriptionToType = (type: CellDescription[2]) => {
  if (type === undefined) return CellType.empty;
  if (type === 0) return CellType.block;
  if (type === 1) return CellType.player;
  throw new Error(`Invalid cell type ${type}`);
};

const mapTypeToCellDescription: Partial<Record<CellType, CellDescription[2]>> = {
  [CellType.player]: 1,
  [CellType.block]: 0,
};

export const serializeLevel = (level: Level): LevelDescription => {
  return level.cells().map((cell: Cell): CellDescription => {
    if (cell.type === CellType.empty) {
      return [cell.x, cell.y];
    }

    if (cell.type === CellType.path) {
      throw new Error('cannot serialize level containing path');
    }

    return [cell.x, cell.y, mapTypeToCellDescription[cell.type]];
  });
};
