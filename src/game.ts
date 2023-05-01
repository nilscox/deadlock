import { Player } from './player';
import { ControlEvent, Controls, EventType } from './controls';
import { Listener } from './emitter';
import { Level } from './level';
import { levels } from './levels';
import { Renderer } from './renderer';

export class Game {
  private currentLevelIndex = 0;

  private level = new Level(levels[this.currentLevelIndex]);
  private player = new Player(this.level);

  constructor(private renderer: Renderer, controls: Controls) {
    renderer.setLevel(this.level);
    renderer.setPlayer(this.player);
    renderer.update();

    controls.addListener(this.handleEvent);
  }

  handleEvent: Listener<ControlEvent> = (event) => {
    if (this.isLevelCompleted()) {
      return;
    }

    if (event.type === EventType.restartLevel) {
      this.restartLevel();
    }

    if (event.type === EventType.move) {
      this.player.move(event.direction);

      if (this.isLevelCompleted()) {
        this.level.completed = true;
        setTimeout(() => this.nextLevel(), 1000);
      }

      this.renderer.update();
    }
  };

  isLevelCompleted() {
    return this.level.emptyCells.length === 1;
  }

  restartLevel() {
    this.level = new Level(levels[this.currentLevelIndex]);
    this.player = new Player(this.level);
    this.player.position = levels[this.currentLevelIndex].startPosition;

    this.renderer.setLevel(this.level);
    this.renderer.setPlayer(this.player);
    this.renderer.update();
  }

  nextLevel() {
    if (this.currentLevelIndex === levels.length - 1) {
      return;
    }

    this.currentLevelIndex++;
    this.restartLevel();
  }
}
