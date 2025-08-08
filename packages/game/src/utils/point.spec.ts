import { describe, expect, it } from 'vitest';

import { Point } from './point';

describe('Point', () => {
  it('new point', () => {
    const point = new Point();

    expect(point.x).toEqual(0);
    expect(point.y).toEqual(0);
  });

  it('point constructor with x and y values', () => {
    const point = new Point(1, 2);

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });

  it('point copy constructor', () => {
    const point = new Point({ x: 1, y: 2 });

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });

  it('set x and y values', () => {
    const point = new Point();

    point.set(1, 2);

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });

  it('set x and y values from other', () => {
    const point = new Point();

    point.set({ x: 1, y: 2 });

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });

  it('set x and y values with setters', () => {
    const point = new Point();

    point.x = 1;
    point.y = 2;

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });
});
