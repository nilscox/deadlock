import { ControlEvent, Controls, Direction, isDirection } from '@deadlock/game';
import Hammer from 'hammerjs';

export class PlayerControls extends Controls {
  private hammer = new Hammer.Manager(document.body);

  constructor() {
    super();

    document.addEventListener('keydown', this.handleKeyDown);

    this.hammer.add(new Hammer.Swipe());
    this.hammer.on('swipe', this.handleSwipe.bind(this));

    this.hammer.add(new Hammer.Tap({ taps: 2 }));
    this.hammer.on('tap', this.handleTap.bind(this));
  }

  cleanup() {
    document.removeEventListener('keydown', this.handleKeyDown);

    this.hammer.stop(true);
    this.hammer.destroy();
    document.body.style.touchAction = '';
  }

  private static domDirectionMap: Record<string, Direction> = {
    ArrowLeft: Direction.left,
    ArrowRight: Direction.right,
    ArrowUp: Direction.up,
    ArrowDown: Direction.down,
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      this.emit(ControlEvent.restartLevel);
    }

    if (event.key === 'b') {
      event.preventDefault();
      this.emit(ControlEvent.movePlayerBack);
    }

    const direction = PlayerControls.domDirectionMap[event.key];

    if (isDirection(direction)) {
      event.preventDefault();
      this.emit(ControlEvent.movePlayer, { direction });
    }
  };

  private handleTap() {
    this.emit(ControlEvent.restartLevel);
  }

  private static hammerDirectionMap: Record<number, Direction> = {
    [Hammer.DIRECTION_LEFT]: Direction.left,
    [Hammer.DIRECTION_RIGHT]: Direction.right,
    [Hammer.DIRECTION_UP]: Direction.up,
    [Hammer.DIRECTION_DOWN]: Direction.down,
  };

  private handleSwipe(input: HammerInput) {
    const direction = PlayerControls.hammerDirectionMap[input.direction];

    if (direction) {
      this.emit(ControlEvent.movePlayer, { direction });
    }
  }
}
