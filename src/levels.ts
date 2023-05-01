import { CellType, LevelDescription, Point } from './level';

const mapCellType: Record<string, CellType> = {
  S: CellType.player,
  ' ': CellType.empty,
  x: CellType.block,
};

// prettier-ignore
export const levels = [
  createLevel([
    'S   ',
  ]),

  createLevel([
    ' xS',
    '   ',
  ]),

  createLevel([
    '  S  ',
  ]),

  createLevel([
    ' xx ',
    ' S  ',
    '    ',
  ]),

  createLevel([
    'S    ',
    '     ',
    ' x   ',
  ]),
]

function createLevel(map: string[]): LevelDescription {
  let startPosition: Point | undefined;
  const width = map[0].length;
  const height = map.length;

  const cells = map.map((line, j) => {
    if (line.length !== width) {
      throw new Error(`Line ${j + 1} has invalid length`);
    }

    return line.split('').map((char, i) => {
      const cellType = charToCellType(char);

      if (cellType === CellType.player) {
        startPosition = [i, j];
        return CellType.empty;
      }

      return cellType;
    });
  });

  if (!startPosition) {
    throw new Error('No start position found');
  }

  return {
    startPosition,
    width,
    height,
    cells,
  };
}

function charToCellType(char: string): CellType {
  const cellType = mapCellType[char[0]];

  if (!cellType) {
    throw new Error('Unknown cell type');
  }

  return cellType;
}
