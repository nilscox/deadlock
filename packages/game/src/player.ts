import { assert } from './utils/assert.js';
import { Emitter } from './utils/emitter.js';
import { type IPoint, Point } from './utils/point.js';

export enum PlayerEvent {
  moved = 'moved',
  teleported = 'teleported',
  reset = 'reset',
}

export type PlayerEventsMap = {
  [PlayerEvent.moved]: IPoint;
  [PlayerEvent.teleported]: IPoint;
};

export class Player extends Emitter<PlayerEvent, PlayerEventsMap> {
  private _start: Point;
  private _position: Point;
  private _path: Point[];

  constructor(start: IPoint) {
    super();

    this._start = new Point(start);
    this._position = this._start.clone();
    this._path = [];
  }

  get position() {
    return this._position.clone();
  }

  reset(start?: IPoint) {
    if (start) {
      this._start.set(start);
    }

    this._position.set(this._start);
    this._path = [];

    this.emit(PlayerEvent.reset);
  }

  move(x: number, y: number) {
    this._path.push(this.position);
    this._position.set(x, y);

    this.emit(PlayerEvent.moved, this._position);
  }

  moveBack() {
    const lastPosition = this._path.pop();

    assert(lastPosition);
    this._position.set(lastPosition);

    this.emit(PlayerEvent.moved, this._position);
  }

  teleport(x: number, y: number) {
    this._path.push(this.position);
    this._position.set(x, y);

    this.emit(PlayerEvent.teleported, this._position);
  }
}
