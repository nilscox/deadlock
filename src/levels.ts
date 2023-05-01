import { CellType, LevelDescription, Point } from './types';

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
    'S   .',
    '     ',
    ' x   ',
  ]),

  createLevel([
    'S    ',
    '     ',
    ' x   ',
  ]),
]

function createLevel(map: string[]): LevelDescription {
  let startPosition: Point | undefined;

  const cells = map
    .flatMap((line, j) => {
      return line.split('').map((char, i) => {
        if (char === '.') {
          return;
        }

        const type = charToCellType(char);

        if (type === CellType.player) {
          startPosition = [i, j];

          return {
            type: CellType.empty,
            x: i,
            y: j,
          };
        }

        return {
          type,
          x: i,
          y: j,
        };
      });
    })
    .filter(Boolean);

  if (!startPosition) {
    throw new Error('No start position found');
  }

  return {
    startPosition,
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
