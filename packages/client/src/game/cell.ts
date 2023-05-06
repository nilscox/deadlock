import { Emitter } from './emitter';
import { IPoint, Point } from './point';

export type CellDescription = [x: number, y: number, type?: 0 | 1];

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

  constructor(private initialPosition: IPoint, private initialType: CellType) {
    super();

    this.position = new Point(initialPosition);
    this._type = initialType;
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

  reset() {
    this.position.set(this.initialPosition);
    this.type = this.initialType;
  }
}
