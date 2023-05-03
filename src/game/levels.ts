import { CellType } from './cell';
import { LevelDescription } from './level';
import generated2 from './levels-unqualified.json' assert { type: 'json' };
import generated from './levels.json' assert { type: 'json' };

const tutorial: Record<string, LevelDescription> = {
  n42pb7: [
    { type: CellType.player, x: 0, y: 0 },
    { type: CellType.empty, x: 1, y: 0 },
    { type: CellType.empty, x: 2, y: 0 },
    { type: CellType.empty, x: 3, y: 0 },
    { type: CellType.empty, x: 4, y: 0 },
  ],
  g388nf: [
    { type: CellType.empty, x: 0, y: 0 },
    { type: CellType.block, x: 1, y: 0 },
    { type: CellType.player, x: 2, y: 0 },
    { type: CellType.empty, x: 0, y: 1 },
    { type: CellType.empty, x: 1, y: 1 },
    { type: CellType.empty, x: 2, y: 1 },
  ],
  vroqj9: [
    { type: CellType.empty, x: 0, y: 0 },
    { type: CellType.empty, x: 1, y: 0 },
    { type: CellType.player, x: 2, y: 0 },
    { type: CellType.empty, x: 3, y: 0 },
    { type: CellType.empty, x: 4, y: 0 },
  ],
  ckdy7w: [
    { type: CellType.empty, x: 0, y: 0 },
    { type: CellType.empty, x: 1, y: 0 },
    { type: CellType.empty, x: 2, y: 0 },
    { type: CellType.empty, x: 0, y: 1 },
    { type: CellType.empty, x: 1, y: 1 },
    { type: CellType.player, x: 2, y: 1 },
    { type: CellType.empty, x: 0, y: 2 },
    { type: CellType.empty, x: 1, y: 2 },
    { type: CellType.empty, x: 2, y: 2 },
  ],
  k4wto6: [
    { type: CellType.player, x: 0, y: 0 },
    { type: CellType.empty, x: 1, y: 0 },
    { type: CellType.empty, x: 2, y: 0 },
    { type: CellType.empty, x: 3, y: 0 },
    { type: CellType.empty, x: 0, y: 1 },
    { type: CellType.empty, x: 1, y: 1 },
    { type: CellType.empty, x: 2, y: 1 },
    { type: CellType.empty, x: 3, y: 1 },
    { type: CellType.empty, x: 4, y: 1 },
    { type: CellType.empty, x: 0, y: 2 },
    { type: CellType.block, x: 1, y: 2 },
    { type: CellType.empty, x: 2, y: 2 },
    { type: CellType.empty, x: 3, y: 2 },
    { type: CellType.empty, x: 4, y: 2 },
  ],
  ceq7ue: [
    { type: CellType.player, x: 0, y: 0 },
    { type: CellType.empty, x: 1, y: 0 },
    { type: CellType.empty, x: 2, y: 0 },
    { type: CellType.empty, x: 3, y: 0 },
    { type: CellType.empty, x: 4, y: 0 },
    { type: CellType.empty, x: 0, y: 1 },
    { type: CellType.empty, x: 1, y: 1 },
    { type: CellType.empty, x: 2, y: 1 },
    { type: CellType.empty, x: 3, y: 1 },
    { type: CellType.empty, x: 4, y: 1 },
    { type: CellType.empty, x: 0, y: 2 },
    { type: CellType.block, x: 1, y: 2 },
    { type: CellType.empty, x: 2, y: 2 },
    { type: CellType.empty, x: 3, y: 2 },
    { type: CellType.empty, x: 4, y: 2 },
  ],
  qb0e1t: [
    { type: CellType.empty, x: 1, y: 0 },
    { type: CellType.block, x: 2, y: 0 },
    { type: CellType.block, x: 3, y: 0 },
    { type: CellType.empty, x: 4, y: 0 },
    { type: CellType.empty, x: 0, y: 1 },
    { type: CellType.empty, x: 1, y: 1 },
    { type: CellType.player, x: 2, y: 1 },
    { type: CellType.empty, x: 3, y: 1 },
    { type: CellType.empty, x: 4, y: 1 },
    { type: CellType.empty, x: 0, y: 2 },
    { type: CellType.empty, x: 1, y: 2 },
    { type: CellType.empty, x: 2, y: 2 },
    { type: CellType.block, x: 3, y: 2 },
    { type: CellType.empty, x: 4, y: 2 },
  ],
};

export const levels = {
  ...tutorial,
  ...(generated as Record<string, LevelDescription>),
  ...(generated2 as Record<string, LevelDescription>),
};
