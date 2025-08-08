import { Direction, Emitter, type IPoint, abs, defined } from '@deadlock/game';

export enum ControlsEvent {
  movePlayer = 'movePlayer',
  movePlayerBack = 'movePlayerBack',
  restartLevel = 'restartLevel',
}

type ControlsEventMap = {
  [ControlsEvent.movePlayer]: { direction: Direction };
};

export class Controls extends Emitter<ControlsEvent, ControlsEventMap> {
  constructor() {
    super();

    document.documentElement.classList.add('no-touch');

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('touchcancel', this.handleTouchEnd);
  }

  cleanup() {
    document.documentElement.classList.remove('no-touch');

    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchEnd);
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
      this.emit(ControlsEvent.restartLevel);
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.emit(ControlsEvent.movePlayerBack);
    }

    const direction = Controls.domDirectionMap[event.key];

    if (direction !== undefined) {
      event.preventDefault();
      this.emit(ControlsEvent.movePlayer, { direction });
    }
  };

  private touchStart?: IPoint;

  private handleTouchStart = (event: TouchEvent) => {
    this.touchStart = {
      x: defined(event.changedTouches[0]).pageX,
      y: defined(event.changedTouches[0]).pageY,
    };
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (!this.touchStart) {
      return;
    }

    const touchEnd = {
      x: defined(event.changedTouches[0]).pageX,
      y: defined(event.changedTouches[0]).pageY,
    };

    const dx = touchEnd.x - this.touchStart.x;
    const dy = touchEnd.y - this.touchStart.y;

    delete this.touchStart;

    if (dx * dx + dy * dy < 16 * 16) {
      this.handleTap();
      return;
    }

    let direction: Direction;

    if (abs(dx) > abs(dy)) {
      direction = dx > 0 ? Direction.right : Direction.left;
    } else {
      direction = dy > 0 ? Direction.down : Direction.up;
    }

    this.emit(ControlsEvent.movePlayer, { direction });
  };

  private lastTapTime?: number;

  private handleTap = () => {
    const elapsed = Date.now() - (this.lastTapTime ?? 0);

    this.lastTapTime = Date.now();

    if (!this.lastTapTime) {
      return;
    }

    if (elapsed < 300) {
      this.emit(ControlsEvent.restartLevel);
    }
  };
}
