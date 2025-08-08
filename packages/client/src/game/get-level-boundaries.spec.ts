import { type IPoint } from '@deadlock/game';
import { describe, expect, it } from 'vitest';

import { getLevelBoundaries } from './get-level-boundaries';

describe('getLevelBoundaries', () => {
  it('one cell', () => {
    const cells: IPoint[] = [{ x: 0, y: 0 }];

    expect(getLevelBoundaries(cells)).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]);
  });

  it('two cells', () => {
    const cells: IPoint[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];

    expect(getLevelBoundaries(cells)).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
    ]);
  });

  it('corner', () => {
    const cells: IPoint[] = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];

    expect(getLevelBoundaries(cells)).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]);
  });

  it('first corner', () => {
    const cells: IPoint[] = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];

    expect(getLevelBoundaries(cells)).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it('complex boundaries', () => {
    const cells: IPoint[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ];

    expect(getLevelBoundaries(cells)).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 0, y: 2 },
    ]);
  });
});
