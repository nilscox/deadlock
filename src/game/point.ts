import { Emitter } from './emitter';

export enum PointEvent {
  changed = 'changed',
}

type PointEventsMap = {
  [PointEvent.changed]: { x: number; y: number };
};

export type IPoint = { x: number; y: number };

type PointArgs = [x: number, y: number] | [IPoint];

export class Point extends Emitter<PointEvent, PointEventsMap> implements IPoint {
  private _x = 0;
  private _y = 0;

  constructor();
  constructor(x: number, y: number);
  constructor(other: IPoint);

  constructor(...args: PointArgs) {
    super();
    this.assign(...args);
  }

  private assign(...args: PointArgs) {
    if (args.length === 2) {
      this._x = args[0];
      this._y = args[1];
    }

    if (args.length === 1) {
      this._x = args[0].x;
      this._y = args[0].y;
    }
  }

  set(x: number, y: number): void;
  set(other: IPoint): void;

  set(...args: PointArgs) {
    this.assign(...args);

    this.emit(PointEvent.changed, {
      x: this.x,
      y: this.y,
    });
  }

  clone() {
    return new Point(this.x, this.y);
  }

  equals(other: IPoint) {
    return this.x === other.x && this.y === other.y;
  }

  get x(): number {
    return this._x;
  }

  set x(x: number) {
    this.set(x, this._y);
  }

  get y(): number {
    return this._y;
  }

  set y(y: number) {
    this.set(this._x, y);
  }
}
