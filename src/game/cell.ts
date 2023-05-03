import { Emitter } from './emitter';
import { IPoint, Point } from './point';

export enum CellType {
  empty = 'empty',
  path = 'path',
  block = 'block',
  player = 'player',
}

export enum CellEvent {
  typeChanged = 'typeChanged',
}

type CellEventsMap = {
  [CellEvent.typeChanged]: { type: CellType };
};

export class Cell extends Emitter<CellEvent, CellEventsMap> implements IPoint {
  public position: Point;
  public _type: CellType;

  constructor(x: number, y: number, type: CellType) {
    super();

    this.position = new Point(x, y);
    this._type = type;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get type(): CellType {
    return this._type;
  }

  set type(type: CellType) {
    this._type = type;
    this.emit(CellEvent.typeChanged, { type });
  }
}
