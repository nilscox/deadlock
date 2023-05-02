import paper from 'paper';

import { ControlEvent, EventType, PaperControls } from './controls';
import { Direction } from './direction';
import { Emitter, Listener } from './emitter';
import { Level } from './level';
import { Player } from './player';
import { GameRenderer } from './renderer';
import { LevelDescription } from './types';

export class Game extends Emitter<GameEvent> {
  public level: Level;
  public player: Player;

  public controls: PaperControls;
  public renderer: GameRenderer;

  constructor(canvas: HTMLCanvasElement, level: LevelDescription) {
    super();

    paper.setup(canvas);

    this.level = new Level(level);
    this.player = new Player(this.level);

    this.renderer = new GameRenderer(this);

    this.controls = new PaperControls();
    this.controls.addListener(this.handleEvent);
  }

  cleanup() {
    this.controls.cleanup();
    paper.project.clear();
  }

  setLevel(level: LevelDescription) {
    this.level = new Level(level);
    this.player = new Player(this.level);
    this.restartLevel();
  }

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
    this.level.reset();
    this.player.reset();

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
