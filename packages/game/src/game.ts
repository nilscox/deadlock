import { Level, type LevelDefinition, LevelEvent } from './level';
import { Player, PlayerEvent } from './player';
import { Stopwatch } from './stopwatch';
import { Direction } from './utils/direction';
import { Emitter } from './utils/emitter';

export enum ControlEvent {
  movePlayer = 'movePlayer',
  movePlayerBack = 'movePlayerBack',
  restartLevel = 'restartLevel',
}

export type ControlsEventsMap = {
  [ControlEvent.movePlayer]: { direction: Direction };
};

export class Controls extends Emitter<ControlEvent, ControlsEventsMap> {}

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

    this.level.addListener(LevelEvent.loaded, () => {
      this.tries = 1;
    });

    this.level.addListener(LevelEvent.restarted, () => {
      this.tries++;
    });

    const pause = this.stopwatch.pause.bind(this.stopwatch);
    const unpause = this.stopwatch.unpause.bind(this.stopwatch);

    let timeout = setTimeout(pause, 10000);

    this.level.addListener(LevelEvent.restarted, () => {
      timeout = setTimeout(pause, 10000);
    });

    this.player.addListener(PlayerEvent.moved, () => {
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

    this.controls.addListener(ControlEvent.movePlayer, (event) => {
      this.level.movePlayer(this.player, event.direction);
    });

    this.controls.addListener(ControlEvent.movePlayerBack, () => {
      this.level.movePlayerBack(this.player);
    });

    this.controls.addListener(ControlEvent.restartLevel, () => {
      this.level.restart();
      this.player.reset();
    });
  }

  disableControls() {
    this.controls.removeListeners();
  }
}
