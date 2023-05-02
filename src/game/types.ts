export type Point = [number, number];

export enum CellType {
  empty = 'empty',
  path = 'path',
  block = 'block',
  player = 'player',
}

export type LevelDescription = Array<{
  x: number;
  y: number;
  type: CellType;
}>;