import { Mock } from 'vitest';
import { Point, PointEvent } from './point';

describe('Point', () => {
  let onChange: Mock;

  beforeEach(() => {
    onChange = vi.fn();
  });

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
    point.addListener(PointEvent.changed, onChange);

    point.set(1, 2);

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);

    expect(onChange).toHaveBeenCalledWith({ x: 1, y: 2 });
  });

  it('set x and y values from other', () => {
    const point = new Point();
    point.addListener(PointEvent.changed, onChange);

    point.set({ x: 1, y: 2 });

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);

    expect(onChange).toHaveBeenCalledWith({ x: 1, y: 2 });
  });

  it('set x and y values with setters', () => {
    const point = new Point();
    point.addListener(PointEvent.changed, onChange);

    point.x = 1;
    point.y = 2;

    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);

    expect(onChange).toHaveBeenCalledWith({ x: 1, y: 2 });
  });
});
