import { Direction, getDirectionVector } from './direction';
import { inspectCustomSymbol } from './inspect';

export type IPoint = { x: number; y: number };

export class Point implements IPoint {
  private _x = 0;
  private _y = 0;

  constructor();
  constructor(x: number, y: number);
  constructor(other: IPoint);

  constructor(...args: PointArgs) {
    if (args.length > 0) {
      this.assign(...args);
    }
  }

  private assign(...args: PointArgs) {
    const [x, y] = pointArgs(args);

    this._x = x;
    this._y = y;
  }

  set(x: number, y: number): void;
  set(other: IPoint): void;

  set(...args: PointArgs) {
    this.assign(...args);
  }

  clone() {
    return new Point(this.x, this.y);
  }

  equals(other: IPoint) {
    return this.x === other.x && this.y === other.y;
  }

  add(x: number, y: number): Point {
    return new Point(this.x + x, this.y + y);
  }

  move(dir: Direction) {
    const [dx, dy] = getDirectionVector(dir);
    return this.add(dx, dy);
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

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  [inspectCustomSymbol]() {
    return this.toString();
  }
}

export type PointArgs = [x: number, y: number] | [IPoint];

export const pointArgs = (args: PointArgs): [x: number, y: number] => {
  if (args.length === 2) {
    return args;
  }

  return [args[0].x, args[0].y];
};
