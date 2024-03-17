export const abs = (value: number) => {
  return Math.abs(value);
};

export const round = (value: number, precision = 0) => {
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

export const clamp = (min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value));
};

export const randBool = (p = 0.5) => {
  return Math.random() < p;
};

export const randFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const randInt = (min: number, max: number) => {
  return Math.floor(randFloat(min, max));
};

export const randItem = <T>(array: T[]) => {
  return array[randInt(0, array.length)];
};

export const randItems = <T>(array: T[], count: number) => {
  return shuffle(array).slice(0, count);
};

export const shuffle = <T>(array: T[]) => {
  return array.sort(() => randFloat(0, 1) - 0.5);
};
