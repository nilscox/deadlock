import { defined } from './assert.ts';

export const directions = ['left', 'right', 'up', 'down'];
export type Direction = (typeof directions)[number];

export type Path = Direction[];

export function isDirection(value: string): value is Direction {
  return Object.values<string>(directions).includes(value);
}

export function isHorizontal(dir: Direction): dir is 'left' | 'right' {
  return dir === 'left' || dir === 'right';
}

export function isVertical(dir: Direction): dir is 'up' | 'down' {
  return dir === 'up' || dir === 'down';
}

export function getOppositeDirection(dir: Direction): Direction {
  return defined({ left: 'right', right: 'left', up: 'down', down: 'up' }[dir]);
}

const directionsMap: Record<Direction, [number, number]> = {
  ['left']: [-1, 0],
  ['right']: [1, 0],
  ['up']: [0, -1],
  ['down']: [0, 1],
};

export function getDirectionVector(direction: Direction): [number, number] {
  return defined(directionsMap[direction]);
}
