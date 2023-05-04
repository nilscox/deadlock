import paper from 'paper';

import { Controls, EventType } from './controls';
import { Level, LevelDescription, LevelEventType } from './level';
import { Player, PlayerEvent } from './player';
import { GameRenderer } from './renderer';

export class Game {
  private scope: paper.PaperScope;

  public level: Level;
  public player: Player;

  private renderer: GameRenderer;
  private controls: Controls;

  constructor(canvas: HTMLCanvasElement) {
    this.scope = new paper.PaperScope();
    this.scope.activate();
    this.scope.setup(canvas);

    this.level = new Level();
    this.player = new Player(this.level);

    this.player.addListener(PlayerEvent.moved, ({ x, y }) => {
      this.level.setPlayerPosition(x, y);
    });

    this.renderer = new GameRenderer(this.scope.view, this);
    this.controls = new Controls();

    this.level.addListener(LevelEventType.loaded, () => {
      this.controls.removeListeners();
      this.controls.addListener(EventType.restartLevel, () => this.restartLevel());
      this.controls.addListener(EventType.moveBack, () => this.player.back());
      this.controls.addListener(EventType.move, (event) => this.player.move(event.direction));
    });

    this.level.addListener(LevelEventType.completed, () => {
      this.controls.removeListeners();
    });

    canvas.addEventListener('mouseover', () => this.scope.activate());
  }

  scale(value: number) {
    this.scope.view.scale(value);
  }

  cleanup() {
    this.controls.cleanup();
  }

  setLevel(level: LevelDescription) {
    this.scope.activate();
    this.level.load(level);
    this.restartLevel();
  }

  restartLevel() {
    this.level.reset();
    this.player.reset();
  }
}
