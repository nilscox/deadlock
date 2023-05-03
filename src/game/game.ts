import { Controls, EventType } from './controls';
import { Direction } from './direction';
import { Emitter } from './emitter';
import { Level, LevelDescription } from './level';
import { Player } from './player';
import { GameRenderer } from './renderer';

export enum GameEventType {
  playerMoved = 'playerMoved',
  levelStarted = 'levelRestarted',
  levelCompleted = 'levelCompleted',
  levelChanged = 'levelChanged',
}

export class Game extends Emitter<GameEventType> {
  public level: Level;
  public player: Player;

  private renderer: GameRenderer;
  private controls = new Controls();

  constructor() {
    super();

    this.level = new Level();
    this.player = new Player(this.level);

    this.renderer = new GameRenderer(this);

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
    this.level.set(level);
    this.emit(GameEventType.levelChanged);
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
