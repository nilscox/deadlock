import { Tool } from 'paper';
import Hammer from 'hammerjs';
import { Direction, isDirection } from './direction';
import { Emitter, Listener } from './emitter';

export enum EventType {
  move = 'move',
  moveBack = 'moveBack',
  restartLevel = 'restartLevel',
}

type MoveEvent = {
  type: EventType.move;
  direction: Direction;
};

type MoveBackEvent = {
  type: EventType.moveBack;
};

type RestartLevelEvent = {
  type: EventType.restartLevel;
};

export type ControlEvent = MoveEvent | MoveBackEvent | RestartLevelEvent;

export interface Controls {
  addListener(listener: Listener<ControlEvent>): void;
}

export class PaperControls extends Emitter<ControlEvent> implements Controls {
  private tool = new Tool();
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

  private handleKeyDown(event: { key: string }) {
    if (event.key === 'space') {
      this.emit({ type: EventType.restartLevel });
    }

    if (event.key === 'b') {
      this.emit({ type: EventType.moveBack });
    }

    if (isDirection(event.key)) {
      this.emit({ type: EventType.move, direction: event.key });
    }
  }

  private handleTap() {
    this.emit({ type: EventType.restartLevel });
  }

  private static directionMap: Record<number, Direction> = {
    [Hammer.DIRECTION_LEFT]: Direction.left,
    [Hammer.DIRECTION_RIGHT]: Direction.right,
    [Hammer.DIRECTION_UP]: Direction.up,
    [Hammer.DIRECTION_DOWN]: Direction.down,
  };

  private handleSwipe(input: HammerInput) {
    const direction = PaperControls.directionMap[input.direction];

    if (direction) {
      this.emit({ type: EventType.move, direction });
    }
  }
}
