import { Direction, getDirectionVector } from './direction';
import { inspectCustomSymbol } from './inspect';

export type IPoint = { x: number; y: number };

type PointArgs = [x: number, y: number] | [IPoint];

export class Point implements IPoint {
  private _x = 0;
  private _y = 0;

  constructor();
  constructor(x: number, y: number);
  constructor(other: IPoint);

  constructor(...args: PointArgs) {
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

  [inspectCustomSymbol]() {
    return `Point(${this.x}, ${this.y})`;
  }
}
