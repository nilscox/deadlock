import { IPoint } from './point';

export const inspectCustomSymbol = Symbol.for('nodejs.util.inspect.custom');

export class AssertionError extends Error {
  constructor(message = 'Assertion error') {
    super(message);
  }
}

export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new AssertionError(message);
  }
}

export const toObject = <T, V>(
  array: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => V
): Record<string, V> => {
  return array.reduce(
    (obj, item) => ({
      ...obj,
      [getKey(item)]: getValue(item),
    }),
    {}
  );
};

export const randomId = () => {
  return Math.random().toString(36).slice(-6);
};

export const copy = (text: string) => {
  window.navigator.clipboard.writeText(text);
};

export type Tick = () => Promise<void>;
const timeoutSymbol = Symbol('timeout');

export const timeout = async <T>(start: (tick: Tick) => Promise<T>, ms: number): Promise<T | void> => {
  let cancelled = false;

  const timeout = setTimeout(() => {
    cancelled = true;
  }, ms);

  try {
    return await start(async () => {
      await new Promise((r) => setTimeout(r, 0));

      if (cancelled) {
        throw timeoutSymbol;
      }
    });
  } catch (error) {
    if (error === timeoutSymbol) {
      return;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
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

export const boundaries = (points: IPoint[]): { min: IPoint; max: IPoint } => {
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);

  return {
    min: { x: Math.min(...xs), y: Math.min(...ys) },
    max: { x: Math.max(...xs), y: Math.max(...ys) },
  };
};
