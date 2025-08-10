import assert from 'node:assert';
import test, { beforeEach, mock, suite } from 'node:test';

import { Stopwatch } from './stopwatch.ts';

await suite('Stopwatch', async () => {
  let time = 0;
  const tick = () => time++;

  const getTime = mock.fn(() => time);

  beforeEach(() => {
    time = 0;
  });

  await test('creates a stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    assert.strictEqual(stopwatch.elapsed, 0);

    tick();
    assert.strictEqual(stopwatch.elapsed, 1);
  });

  await test('restarts a stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    tick();
    stopwatch.restart();

    assert.strictEqual(stopwatch.elapsed, 0);

    tick();
    assert.strictEqual(stopwatch.elapsed, 1);
  });

  await test('pauses a stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    stopwatch.pause();
    assert.strictEqual(stopwatch.paused, true);

    tick();
    assert.strictEqual(stopwatch.elapsed, 0);

    stopwatch.unpause();
    assert.strictEqual(stopwatch.paused, false);
    assert.strictEqual(stopwatch.elapsed, 0);

    tick();
    assert.strictEqual(stopwatch.elapsed, 1);
  });

  await test('restarts a paused stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    stopwatch.pause();
    stopwatch.restart();
    tick();

    assert.strictEqual(stopwatch.paused, false);
    assert.strictEqual(stopwatch.elapsed, 1);
  });
});
