import { ControlEvent, EventType } from './controls';
import { Direction } from './direction';
import { Emitter, Listener } from './emitter';
import { Level } from './level';
import { levels } from './levels';
import { Player } from './player';

const levelIds = Object.keys(levels);
const nextLevelId = (id: string) => levelIds[levelIds.indexOf(id) + 1];

export class Game extends Emitter<GameEvent> {
  private currentLevelId = levelIds[0];

  public level = new Level(levels[this.currentLevelId]);
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
    const level = levels[this.currentLevelId];

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
      this.emit({ type: GameEventType.levelCompleted });
    }
  }

  nextLevel() {
    this.currentLevelId = nextLevelId(this.currentLevelId);

    if (!this.currentLevelId) {
      return;
    }

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
