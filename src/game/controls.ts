import paper from 'paper';
import Hammer from 'hammerjs';

import { Direction, isDirection } from './direction';
import { Emitter } from './emitter';

export enum EventType {
  move = 'move',
  moveBack = 'moveBack',
  restartLevel = 'restartLevel',
}

type ControlEvents = {
  [EventType.move]: { direction: Direction };
};

export class Controls extends Emitter<EventType, ControlEvents> {
  private tool = new paper.Tool();
  private hammer = new Hammer.Manager(document.body);

  constructor() {
    super();

    this.tool.onKeyDown = this.handleKeyDown.bind(this);

    this.hammer.add(new Hammer.Swipe());
    this.hammer.on('swipe', this.handleSwipe.bind(this));

    this.hammer.add(new Hammer.Tap({ taps: 2 }));
    this.hammer.on('tap', this.handleTap.bind(this));
  }

  cleanup() {
    this.tool.remove();

    this.hammer.stop(true);
    this.hammer.destroy();
    document.body.style.touchAction = '';
  }

  private handleKeyDown(event: { key: string; event: KeyboardEvent }) {
    if (event.key === 'space') {
      event.event.preventDefault();
      this.emit(EventType.restartLevel);
    }

    if (event.key === 'b') {
      this.emit(EventType.moveBack);
    }

    if (isDirection(event.key)) {
      event.event.preventDefault();
      this.emit(EventType.move, { direction: event.key });
    }
  }

  private handleTap() {
    this.emit(EventType.restartLevel);
  }

  private static directionMap: Record<number, Direction> = {
    [Hammer.DIRECTION_LEFT]: Direction.left,
    [Hammer.DIRECTION_RIGHT]: Direction.right,
    [Hammer.DIRECTION_UP]: Direction.up,
    [Hammer.DIRECTION_DOWN]: Direction.down,
  };

  private handleSwipe(input: HammerInput) {
    const direction = Controls.directionMap[input.direction];

    if (direction) {
      this.emit(EventType.move, { direction });
    }
  }
}
