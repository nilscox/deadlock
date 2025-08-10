import { Level, type LevelDefinition } from './level.ts';
import { Player } from './player.ts';
import { Stopwatch } from './stopwatch.ts';
import { type Direction } from './utils/direction.ts';
import { Emitter } from './utils/emitter.ts';

export type ControlsEventsMap = {
  movePlayer: { direction: Direction };
  movePlayerBack: never;
  restartLevel: never;
};

export class Controls extends Emitter<ControlsEventsMap> {}

export class Game {
  private controls: Controls;

  public readonly level: Level;
  public readonly player: Player;

  public tries = 1;
  public stopwatch = new Stopwatch();

  constructor(controls: Controls, levelDefinition: LevelDefinition) {
    this.controls = controls.cloneEmitter();

    this.level = Level.load(levelDefinition);
    this.player = new Player(this.level.start);

    this.enableControls();

    this.level.addListener('loaded', () => {
      this.tries = 1;
    });

    this.level.addListener('restarted', () => {
      this.tries++;
    });

    const pause = this.stopwatch.pause.bind(this.stopwatch);
    const unpause = this.stopwatch.unpause.bind(this.stopwatch);

    let timeout = setTimeout(pause, 10000);

    this.level.addListener('restarted', () => {
      timeout = setTimeout(pause, 10000);
    });

    this.player.addListener('moved', () => {
      clearTimeout(timeout);
      unpause();
      timeout = setTimeout(pause, 1000);
    });
  }

  setLevel(levelDefinition: LevelDefinition) {
    this.level.load(levelDefinition);
    this.player.reset(this.level.start);
  }

  enableControls() {
    this.controls.removeListeners();

    this.controls.addListener('movePlayer', (event) => {
      this.level.movePlayer(this.player, event.direction);
    });

    this.controls.addListener('movePlayerBack', () => {
      this.level.movePlayerBack(this.player);
    });

    this.controls.addListener('restartLevel', () => {
      this.level.restart();
      this.player.reset();
    });
  }

  disableControls() {
    this.controls.removeListeners();
  }
}
