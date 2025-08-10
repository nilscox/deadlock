import assert from 'node:assert';
import test, { suite } from 'node:test';

import { Point } from './point.ts';

await suite('Point', async () => {
  await test('new point', () => {
    const point = new Point();

    assert.strictEqual(point.x, 0);
    assert.strictEqual(point.y, 0);
  });

  await test('point constructor with x and y values', () => {
    const point = new Point(1, 2);

    assert.strictEqual(point.x, 1);
    assert.strictEqual(point.y, 2);
  });

  await test('point copy constructor', () => {
    const point = new Point({ x: 1, y: 2 });

    assert.strictEqual(point.x, 1);
    assert.strictEqual(point.y, 2);
  });

  await test('set x and y values', () => {
    const point = new Point();

    point.set(1, 2);

    assert.strictEqual(point.x, 1);
    assert.strictEqual(point.y, 2);
  });

  await test('set x and y values from other', () => {
    const point = new Point();

    point.set({ x: 1, y: 2 });

    assert.strictEqual(point.x, 1);
    assert.strictEqual(point.y, 2);
  });

  await test('set x and y values with setters', () => {
    const point = new Point();

    point.x = 1;
    point.y = 2;

    assert.strictEqual(point.x, 1);
    assert.strictEqual(point.y, 2);
  });
});
