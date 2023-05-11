import paper from 'paper';
import { assert, Emitter, IPoint } from '@deadlock/game';

export enum AnimationEvent {
  started = 'started',
  ended = 'ended',
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function interpolate(a: number, b: number, t: number) {
  return (b - a) * t + a;
}

abstract class Animation extends Emitter<AnimationEvent> {
  private _startAt?: number;

  constructor(public duration: number) {
    super();

    this.addListener(AnimationEvent.started, () => {
      this._startAt = Date.now();
    });

    this.addListener(AnimationEvent.ended, () => {
      delete this._startAt;
    });
  }

  protected abstract onFrame(t: number): void;
  protected abstract onEnd(): void;

  frame(): void {
    if (!this._startAt) {
      return;
    }

    const elapsed = Date.now() - this._startAt;

    if (elapsed >= this.duration) {
      this.onEnd();
    } else {
      this.onFrame(easeOutCubic(elapsed / this.duration));
    }
  }
}

export class PositionAnimation extends Animation {
  private _start?: IPoint;
  private _end?: IPoint;

  constructor(private item: paper.Item, duration: number) {
    super(duration);

    this.addListener(AnimationEvent.ended, () => {
      delete this._start;
      delete this._end;
    });
  }

  set target(target: IPoint) {
    this._start = this.item.bounds.topLeft.clone();
    this._end = { ...target };
    this.emit(AnimationEvent.started);
  }

  protected onEnd(): void {
    this.item.bounds.topLeft.set(this._end);
    this.emit(AnimationEvent.ended);
  }

  protected onFrame(t: number): void {
    assert(this._start);
    assert(this._end);

    this.item.bounds.topLeft.set(
      interpolate(this._start.x, this._end.x, t),
      interpolate(this._start.y, this._end.y, t)
    );
  }
}

export class ScaleAnimation extends Animation {
  private _start?: IPoint;
  private _end?: IPoint;

  constructor(private item: paper.Item, duration: number) {
    super(duration);

    this.addListener(AnimationEvent.ended, () => {
      delete this._end;
    });
  }

  set target(target: number) {
    this._start = this.item.scaling.clone();
    this._end = { x: target, y: target };
    this.emit(AnimationEvent.started);
  }

  protected onEnd(): void {
    this.item.scaling.set(this._end);
    this.emit(AnimationEvent.ended);
  }

  protected onFrame(t: number): void {
    assert(this._start);
    assert(this._end);

    this.item.scaling.set(
      interpolate(this._start.x, this._end.x, t),
      interpolate(this._start.y, this._end.y, t)
    );
  }
}

export class ColorAnimation extends Animation {
  private _from?: paper.Color;
  private _to?: paper.Color;

  constructor(private item: paper.Item, duration: number) {
    super(duration);

    this.addListener(AnimationEvent.ended, () => {
      delete this._from;
      delete this._to;
    });
  }

  set target(target: paper.Color) {
    assert(this.item.fillColor);

    this._from = this.item.fillColor.clone();
    this._to = target.clone();

    this.emit(AnimationEvent.started);
  }

  protected onEnd(): void {
    assert(this.item.fillColor);
    assert(this._to);

    this.item.fillColor = this._to;

    this.emit(AnimationEvent.ended);
  }

  protected onFrame(t: number): void {
    assert(this.item.fillColor);
    assert(this._from);
    assert(this._to);

    this.item.fillColor = new paper.Color(
      interpolate(this._from.red, this._to.red, t),
      interpolate(this._from.green, this._to.green, t),
      interpolate(this._from.blue, this._to.blue, t)
    );
  }
}
