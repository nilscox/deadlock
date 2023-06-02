import { ControlEvent, Controls, Direction, IPoint, abs, isDirection } from '@deadlock/game';

export class PlayerControls extends Controls {
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

  private touchStart?: IPoint;

  private handleTouchStart = (event: TouchEvent) => {
    this.touchStart = {
      x: event.changedTouches[0].pageX,
      y: event.changedTouches[0].pageY,
    };
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (!this.touchStart) {
      return;
    }

    const touchEnd = {
      x: event.changedTouches[0].pageX,
      y: event.changedTouches[0].pageY,
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

    this.emit(ControlEvent.movePlayer, { direction });
  };

  private lastTapTime?: number;

  private handleTap = () => {
    const elapsed = Date.now() - (this.lastTapTime ?? 0);

    this.lastTapTime = Date.now();

    if (!this.lastTapTime) {
      return;
    }

    if (elapsed < 300) {
      this.handleDoubleTap();
    }
  };

  private handleDoubleTap = () => {
    this.emit(ControlEvent.restartLevel);
  };
}
