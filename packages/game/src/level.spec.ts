import assert from 'node:assert';
import test, { mock, suite } from 'node:test';

import { Level, type LevelDefinition } from './level.ts';
import { Player } from './player.ts';
import { Point } from './utils/point.ts';

const setup = (definition?: Partial<LevelDefinition>) => {
  const level = Level.load({
    width: 1,
    height: 1,
    start: { x: 0, y: 0 },
    blocks: [],
    teleports: [],
    ...definition,
  });

  const player = new Player(level.definition.start);

  return {
    level,
    player,
  };
};

await suite('Level', async () => {
  await test('loads a level', () => {
    const level = Level.load({
      width: 3,
      height: 1,
      start: { x: 1, y: 0 },
      blocks: [{ x: 0, y: 0 }],
      teleports: [],
    });

    assert.strictEqual(level.map.at(0, 0), 'block');
    assert.strictEqual(level.map.at(1, 0), 'player');
    assert.strictEqual(level.map.at(2, 0), 'empty');
    assert.strictEqual(level.map.atUnsafe(3, 0), undefined);
  });

  await test('loads a new level', () => {
    const fn = mock.fn();
    const { level } = setup();

    level.addListener('loaded', fn);
    level.load({ width: 2, height: 1, blocks: [], start: { x: 0, y: 0 }, teleports: [] });

    assert.strictEqual(level.map.at(1, 0), 'empty');
    assert.equal(fn.mock.callCount(), 1);
  });

  await test('restarts a level', () => {
    const fn = mock.fn();
    const { level, player } = setup({
      width: 2,
    });

    level.addListener('restarted', fn);

    level.movePlayer(player, 'right');
    level.restart();

    assert.strictEqual(level.map.at(1, 0), 'empty');
    assert.equal(fn.mock.callCount(), 1);
  });

  await test('moves the player', () => {
    const { level, player } = setup({
      width: 3,
    });

    assert.deepStrictEqual(level.movePlayer(player, 'right'), true);

    assert.deepStrictEqual(player.position, new Point(1, 0));

    assert.strictEqual(level.map.at(0, 0), 'path');
    assert.strictEqual(level.map.at(1, 0), 'player');
  });

  await test('emits events when a cell changes', () => {
    const fn = mock.fn();
    const { level, player } = setup({
      width: 3,
    });

    level.addListener('cellChanged', fn);
    level.movePlayer(player, 'right');

    assert.deepStrictEqual(fn.mock.calls[0]?.arguments, [{ x: 0, y: 0, type: 'path' }]);
    assert.deepStrictEqual(fn.mock.calls[1]?.arguments, [{ x: 1, y: 0, type: 'player' }]);
  });

  await test('moves the player backwards', () => {
    const { level, player } = setup({
      width: 2,
    });

    level.movePlayer(player, 'right');
    assert.deepStrictEqual(level.movePlayerBack(player), true);
    assert.deepStrictEqual(level.movePlayerBack(player), false);

    assert.deepStrictEqual(player.position, new Point(0, 0));

    assert.strictEqual(level.map.at(0, 0), 'player');
    assert.strictEqual(level.map.at(1, 0), 'empty');
  });

  await test("jumps over the player's path", () => {
    const { level, player } = setup({
      width: 3,
      start: { x: 1, y: 0 },
    });

    level.movePlayer(player, 'left');
    level.movePlayer(player, 'right');

    assert.deepStrictEqual(player.position, new Point(2, 0));

    assert.strictEqual(level.map.at(0, 0), 'path');
    assert.strictEqual(level.map.at(1, 0), 'path');
    assert.strictEqual(level.map.at(2, 0), 'player');
  });

  await test('does not move when there is no cell', () => {
    const { level, player } = setup();

    assert.deepStrictEqual(level.movePlayer(player, 'right'), false);

    assert.deepStrictEqual(player.position, new Point(0, 0));
  });

  await test('does not move when there is a block', () => {
    const { level, player } = setup({
      width: 3,
      blocks: [{ x: 1, y: 0 }],
    });

    assert.deepStrictEqual(level.movePlayer(player, 'right'), false);

    assert.deepStrictEqual(player.position, new Point(0, 0));
  });

  await test('teleports the player to another location', () => {
    const { level, player } = setup({
      width: 3,
      blocks: [],
      teleports: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    });

    assert.deepStrictEqual(level.movePlayer(player, 'right'), true);

    assert.deepStrictEqual(player.position, new Point(2, 0));

    assert.deepStrictEqual(level.map.at(0, 0), 'path');
  });

  await test('teleports the player backwards', () => {
    const { level, player } = setup({
      width: 3,
      blocks: [],
      teleports: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    });

    assert.deepStrictEqual(level.movePlayer(player, 'right'), true);
    assert.deepStrictEqual(level.movePlayerBack(player), true);

    assert.deepStrictEqual(player.position, new Point(0, 0));

    assert.deepStrictEqual(level.map.at(0, 0), 'player');
    assert.deepStrictEqual(level.map.at(1, 0), 'teleport');
    assert.deepStrictEqual(level.map.at(1, 0), 'teleport');
  });

  await test('emits an event when the level is completed', () => {
    const fn = mock.fn();
    const { level, player } = setup({
      width: 3,
    });

    level.addListener('completed', fn);

    level.movePlayer(player, 'right');
    assert.equal(fn.mock.callCount(), 0);

    level.movePlayer(player, 'right');
    assert.equal(fn.mock.callCount(), 1);
  });

  await test('restarts a level', () => {
    const { level, player } = setup({
      width: 4,
      height: 1,
      start: { x: 0, y: 0 },
      blocks: [],
      teleports: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
    });

    const fn = mock.fn();
    const definition = level.map.definition;

    level.addListener('restarted', fn);

    level.movePlayer(player, 'right');
    level.movePlayer(player, 'right');
    level.restart();

    assert.deepStrictEqual(level.map.definition, definition);
    assert.equal(fn.mock.callCount(), 1);
  });

  await test("computes a level's hash", () => {
    const level = Level.load({
      width: 2,
      height: 3,
      start: { x: 0, y: 2 },
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      teleports: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
    });

    assert.deepStrictEqual(level.hash, '2,3B0,0;1,0T0,1;1,1S0,2');
  });

  await test('loads a level from its hash', () => {
    const level = Level.load('2,3B0,0;1,0T0,1;1,1S0,2');

    assert.deepStrictEqual(level.definition, {
      width: 2,
      height: 3,
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      teleports: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      start: { x: 0, y: 2 },
    });
  });

  await test("computes a level's fingerprint", () => {
    const level1 = Level.load({
      width: 3,
      height: 1,
      start: { x: 1, y: 0 },
      blocks: [{ x: 0, y: 0 }],
      teleports: [],
    });

    const level2 = Level.load({
      width: 3,
      height: 1,
      start: { x: 1, y: 0 },
      blocks: [{ x: 2, y: 0 }],
      teleports: [],
    });

    assert.deepStrictEqual(level1.fingerprint, level2.fingerprint);
  });

  await test("computes a level's fingerprint 2", () => {
    const level1 = Level.load('3,3B1,0S0,0');
    const level2 = Level.load(level1.fingerprint);

    assert.deepStrictEqual(level1.fingerprint, level2.fingerprint);
  });
});
