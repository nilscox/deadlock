import { Controls, EventType } from './controls';
import { Direction } from './direction';
import { Emitter } from './emitter';
import { Level } from './level';
import { Player } from './player';
import { GameRenderer } from './renderer';
import { LevelDescription } from './types';

export enum GameEventType {
  playerMoved = 'playerMoved',
  levelStarted = 'levelRestarted',
  levelCompleted = 'levelCompleted',
}

export class Game extends Emitter<GameEventType> {
  public level: Level;
  public player: Player;

  private renderer: GameRenderer;
  private controls = new Controls();

  constructor(canvas: HTMLCanvasElement, level: LevelDescription) {
    super();

    this.level = new Level(level);
    this.player = new Player(this.level);

    this.renderer = new GameRenderer(canvas, this);

    this.addListener(GameEventType.levelStarted, () => {
      this.controls.removeListeners();
      this.controls.addListener(EventType.restartLevel, () => this.restartLevel());
      this.controls.addListener(EventType.moveBack, () => this.moveBack());
      this.controls.addListener(EventType.move, (event) => this.handleMove(event.direction));
    });

    this.addListener(GameEventType.levelCompleted, () => {
      this.controls.removeListeners();
    });
  }

  cleanup() {
    this.renderer.cleanup();
    this.controls.cleanup();
  }

  setLevel(level: LevelDescription) {
    this.level = new Level(level);
    this.player = new Player(this.level);
    this.restartLevel();
  }

  moveBack() {
    if (this.player.back()) {
      this.emit(GameEventType.playerMoved);
    }
  }

  isLevelCompleted() {
    return this.level.emptyCells.length === 1;
  }

  restartLevel() {
    this.level.reset();
    this.player.reset();

    this.emit(GameEventType.levelStarted);
  }

  handleMove(direction: Direction) {
    if (!this.player.move(direction)) {
      return;
    }

    this.emit(GameEventType.playerMoved);

    if (this.isLevelCompleted()) {
      this.emit(GameEventType.levelCompleted);
    }
  }
}
