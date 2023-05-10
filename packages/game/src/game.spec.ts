import { ControlEvent, Controls, Game } from './game';
import { Direction } from './utils/direction';
import { Point } from './utils/point';

describe('Game', () => {
  it('creates a new game', () => {
    const controls = new Controls();

    const game = new Game(controls, {
      width: 2,
      height: 1,
      blocks: [],
      start: { x: 0, y: 0 },
      teleports: [],
    });

    controls.emit(ControlEvent.movePlayer, { direction: Direction.right });

    expect(game.player.position).toEqual(new Point({ x: 1, y: 0 }));
  });
});
