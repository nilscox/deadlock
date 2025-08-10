import { type Direction, getDirectionVector } from './direction.ts';
import { inspectCustomSymbol } from './inspect.ts';

export type IPoint = { x: number; y: number };

export class Point implements IPoint {
  private _x = 0;
  private _y = 0;

  constructor();
  constructor(x: number, y: number);
  // eslint-disable-next-line @typescript-eslint/unified-signatures
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

  equals(x: number, y: number): boolean;
  equals(other: IPoint): boolean;

  equals(...args: PointArgs) {
    const [x, y] = pointArgs(args);
    return this.x === x && this.y === y;
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
    return `(${String(this.x)}, ${String(this.y)})`;
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
