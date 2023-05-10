import { Emitter } from './utils/emitter';
import { IPoint, Point } from './utils/point';

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
  private _position: Point;
  private _path: Point[];

  constructor(private _start: Point) {
    super();

    this._position = _start.clone();
    this._path = [];
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
    this._position.set(point);

    this.emit(PlayerEvent.moved, this._position);
  }

  moveBack(): boolean {
    const lastPosition = this._path.pop();

    if (!lastPosition) {
      return false;
    }

    this._position.set(lastPosition);

    this.emit(PlayerEvent.moved, this._position);

    return true;
  }

  teleport(point: Point) {
    this._path.push(this.position);
    this._position.set(point);

    this.emit(PlayerEvent.teleported, this._position);
  }
}
