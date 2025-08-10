import assert from 'node:assert';
import test, { suite } from 'node:test';

import { Controls, Game } from './game.ts';
import { Point } from './utils/point.ts';

await suite('Game', async () => {
  await test('creates a new game', () => {
    const controls = new Controls();

    const game = new Game(controls, {
      width: 2,
      height: 1,
      start: { x: 0, y: 0 },
      blocks: [],
      teleports: [],
    });

    controls.emit('movePlayer', { direction: 'right' });

    assert.deepStrictEqual(game.player.position, new Point({ x: 1, y: 0 }));
  });
});
