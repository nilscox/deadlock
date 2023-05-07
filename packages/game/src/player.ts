import { Emitter } from './utils/emitter';
import { Point } from './utils/point';

export enum PlayerEvent {
  moved = 'moved',
  reset = 'reset',
}

export type PlayerEventsMap = {
  [PlayerEvent.moved]: { x: number; y: number };
};

export class Player extends Emitter<PlayerEvent, PlayerEventsMap> {
  private _position: Point;
  private _path: Point[];

  constructor(private _start: Point) {
    super();

    this._position = _start.clone();
    this._path = [];
  }

  private set position(position: Point) {
    this._position.set(position);
    this.emit(PlayerEvent.moved, this._position);
  }

  get position() {
    return this._position.clone();
  }

  reset(start?: Point) {
    if (start) {
      this._start.set(start);
    }

    this._position.set(this._start);
    this._path = [];

    this.emit(PlayerEvent.reset);
  }

  move(point: Point) {
    this._path.push(this.position);
    this.position = point;
  }

  moveBack(): boolean {
    if (this._path.length === 0) {
      return false;
    }

    this.position = this._path.pop() as Point;

    return true;
  }
}
