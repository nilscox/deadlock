import { IPoint } from './point';

export const identity = <T>(value: T) => {
  return value;
};

export const abs = (value: number) => {
  return Math.abs(value);
};

export const round = (value: number, precision: number) => {
  const p10 = Math.pow(10, precision);
  return Math.round(p10 * value) / p10;
};

export const mean = (values: number[]) => {
  return round(sum(values) / values.length, 2);
};

export const sum = (values: number[]) => {
  return values.reduce((a, b) => a + b, 0);
};

export const min = (values: number[]) => {
  return Math.min(...values);
};

export const max = (values: number[]) => {
  return Math.max(...values);
};

export const randBool = (p = 0.5) => {
  return Math.random() < p;
};

export const randFloat = (min: number, max: number) => {
  return Math.random() * (max - min + 1) + min;
};

export const randInt = (min: number, max: number) => {
  return Math.floor(randFloat(min, max));
};

export const randItem = <T>(array: T[]) => {
  return array[randInt(0, array.length - 1)];
};

export const randItems = <T>(array: T[], count: number) => {
  return shuffle(array).slice(0, count);
};

export const shuffle = <T>(array: T[]) => {
  return array.sort(() => (randBool() ? -1 : 1));
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
