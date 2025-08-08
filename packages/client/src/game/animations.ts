import { Emitter } from '@deadlock/game';

import { type EasingFunction, easings } from '../math';

export enum AnimationEvent {
  started = 'started',
  completed = 'completed',
  update = 'update',
}

export interface AnimationEventMap {
  [AnimationEvent.update]: { t: number };
}

type AnimationOptions = Partial<{
  duration: number;
  ease: EasingFunction;
}>;

export class Animation extends Emitter<AnimationEvent, AnimationEventMap> {
  private startedAt: number | null;
  private duration: number;
  private ease: EasingFunction;

  constructor(options: AnimationOptions = {}) {
    super();

    this.startedAt = null;
    this.duration = options.duration ?? 100;
    this.ease = options.ease ?? easings.linear;
  }

  private get t() {
    if (this.startedAt === null) {
      return null;
    }

    return this.ease((Date.now() - this.startedAt) / this.duration);
  }

  start() {
    this.startedAt = Date.now();
    this.emit(AnimationEvent.started);
  }

  update() {
    const t = this.t;

    if (t === null) {
      return;
    }

    if (t < 1) {
      this.emit(AnimationEvent.update, { t });
    } else {
      this.emit(AnimationEvent.completed);
    }
  }
}
