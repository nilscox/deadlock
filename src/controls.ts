import { Tool } from 'paper';
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

  constructor() {
    super();
    this.tool.onKeyDown = this.handleKeyDown.bind(this);
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
}
