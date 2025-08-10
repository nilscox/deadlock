import { describe, expect, it } from 'vitest';

import { ControlEvent, Controls, Game } from './game.js';
import { Direction } from './utils/direction.js';
import { Point } from './utils/point.js';

describe('Game', () => {
  it('creates a new game', () => {
    const controls = new Controls();

    const game = new Game(controls, {
      width: 2,
      height: 1,
      start: { x: 0, y: 0 },
      blocks: [],
      teleports: [],
    });

    controls.emit(ControlEvent.movePlayer, { direction: Direction.right });

    expect(game.player.position).toEqual(new Point({ x: 1, y: 0 }));
  });
});
