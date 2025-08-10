import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Stopwatch } from './stopwatch.js';

describe('Stopwatch', () => {
  let time = 0;
  const tick = () => time++;

  const getTime = vi.fn(() => time);

  beforeEach(() => {
    time = 0;
  });

  it('creates a stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    expect(stopwatch.elapsed).toEqual(0);

    tick();
    expect(stopwatch.elapsed).toEqual(1);
  });

  it('restarts a stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    tick();
    stopwatch.restart();

    expect(stopwatch.elapsed).toEqual(0);

    tick();
    expect(stopwatch.elapsed).toEqual(1);
  });

  it('pauses a stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    stopwatch.pause();
    expect(stopwatch.paused).toBe(true);

    tick();
    expect(stopwatch.elapsed).toBe(0);

    stopwatch.unpause();
    expect(stopwatch.paused).toBe(false);
    expect(stopwatch.elapsed).toBe(0);

    tick();
    expect(stopwatch.elapsed).toBe(1);
  });

  it('restarts a paused stopwatch', () => {
    const stopwatch = new Stopwatch(getTime);

    stopwatch.pause();
    stopwatch.restart();
    tick();

    expect(stopwatch.paused).toBe(false);
    expect(stopwatch.elapsed).toBe(1);
  });
});
