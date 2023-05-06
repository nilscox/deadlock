import { Level, LevelDefinition } from './level';
import { Player } from './player';
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

  public allowRestartWhenCompleted = false;

  constructor(controls: Controls, levelDefinition: LevelDefinition) {
    this.controls = controls.cloneEmitter();

    this.level = new Level(levelDefinition);
    this.player = new Player(this.level.start);

    this.controls.addListener(ControlEvent.movePlayer, (event) => {
      this.level.movePlayer(this.player, event.direction);
    });

    this.controls.addListener(ControlEvent.movePlayerBack, () => {
      if (this.level.isCompleted() && !this.allowRestartWhenCompleted) {
        return;
      }

      this.level.movePlayerBack(this.player);
    });

    this.controls.addListener(ControlEvent.restartLevel, () => {
      if (this.level.isCompleted() && !this.allowRestartWhenCompleted) {
        return;
      }

      this.level.restart();
      this.player.reset();
    });
  }

  setLevel(levelDefinition: LevelDefinition) {
    this.level.load(levelDefinition);
    this.player.reset(this.level.start);
  }
}
