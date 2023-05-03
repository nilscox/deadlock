import { IPoint, Point } from './point';

export enum CellType {
  empty = 'empty',
  path = 'path',
  block = 'block',
  player = 'player',
}

export class Cell implements IPoint {
  public position: Point;
  public type: CellType;

  constructor(x: number, y: number, type: CellType) {
    this.position = new Point(x, y);
    this.type = type;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }
}
