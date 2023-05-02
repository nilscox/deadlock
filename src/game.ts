import { ControlEvent, EventType } from './controls';
import { Direction } from './direction';
import { Emitter, Listener } from './emitter';
import { Level } from './level';
import { levels } from './levels';
import { Player } from './player';

export class Game extends Emitter<GameEvent> {
  private currentLevelIndex = 0;

  public level = new Level(levels[this.currentLevelIndex]);
  public player = new Player(this.level);

  handleEvent: Listener<ControlEvent> = (event) => {
    if (this.isLevelCompleted()) {
      return;
    }

    if (event.type === EventType.restartLevel) {
      this.restartLevel();
    }

    if (event.type === EventType.moveBack) {
      this.player.back();
      this.emit({ type: GameEventType.playerMoved });
    }

    if (event.type === EventType.move) {
      this.handleMove(event.direction);
    }
  };

  isLevelCompleted() {
    return this.level.emptyCells.length === 1;
  }

  restartLevel() {
    const level = levels[this.currentLevelIndex];

    this.level = new Level(level);
    this.player = new Player(this.level);

    this.emit({ type: GameEventType.levelStarted });
  }

  handleMove(direction: Direction) {
    if (!this.player.move(direction)) {
      return;
    }

    this.emit({ type: GameEventType.playerMoved });

    if (this.isLevelCompleted()) {
      this.level.completed = true;
      this.emit({ type: GameEventType.levelCompleted });
    }
  }

  nextLevel() {
    if (this.currentLevelIndex === levels.length - 1) {
      return;
    }

    this.currentLevelIndex++;
    this.restartLevel();
  }
}

export enum GameEventType {
  playerMoved = 'playerMoved',
  levelStarted = 'levelRestarted',
  levelCompleted = 'levelCompleted',
}

type PlayerMovedEvent = {
  type: GameEventType.playerMoved;
};

type LevelRestartedEvent = {
  type: GameEventType.levelStarted;
};

type LevelCompleted = {
  type: GameEventType.levelCompleted;
};

export type GameEvent = PlayerMovedEvent | LevelRestartedEvent | LevelCompleted;
