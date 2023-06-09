import { IPoint } from './point';

export const identity = <T>(value: T) => {
  return value;
};

export const getId = <T extends { id: string }>(obj: T) => {
  return obj.id;
};

export const getIds = <T extends { id: string }>(array: Array<T>) => {
  return array.map(getId);
};

export const randomId = () => {
  return Math.random().toString(36).slice(-6);
};

export const boundaries = (points: IPoint[]): { min: IPoint; max: IPoint } => {
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);

  return {
    min: { x: Math.min(...xs), y: Math.min(...ys) },
    max: { x: Math.max(...xs), y: Math.max(...ys) },
  };
};

export const first = <T>(array: T[]): T | undefined => {
  return array[0];
};

export const last = <T>(array: T[]): T | undefined => {
  return array[array.length - 1];
};

export const array = <T>(length: number, createElement: (index: number) => T): T[] => {
  return Array(length)
    .fill(null)
    .map((_, index) => createElement(index));
};

export const isDefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};
