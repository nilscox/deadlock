import { Tool } from 'paper';
import { Direction, isDirection } from './direction';

export enum EventType {
  move = 'move',
  restartLevel = 'restartLevel',
}

type MoveEvent = {
  type: EventType.move;
  direction: Direction;
};

type RestartLevelEvent = {
  type: EventType.restartLevel;
};

export type Event = MoveEvent | RestartLevelEvent;
export type EventListener = (event: Event) => void;

export interface Controls {
  addListener(listener: EventListener): void;
}

export class PaperControls implements Controls {
  private tool = new Tool();
  private listeners = new Array<EventListener>();

  constructor() {
    this.tool.onKeyDown = this.handleKeyDown.bind(this);
  }

  addListener(listener: EventListener): void {
    this.listeners.push(listener);
  }

  private handleKeyDown(event: { key: string }) {
    if (event.key === 'space') {
      this.emit({ type: EventType.restartLevel });
    }

    if (isDirection(event.key)) {
      this.emit({ type: EventType.move, direction: event.key });
    }
  }

  private emit(event: Event) {
    this.listeners.forEach((listener) => listener(event));
  }
}
