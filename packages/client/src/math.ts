export function interpolate(a: number, b: number, t: number) {
  return (b - a) * t + a;
}

export type EasingFunction = (value: number) => number;

const linear: EasingFunction = (t) => t;
const easeInCubic: EasingFunction = (x) => Math.pow(x, 3);
const easeOutCubic: EasingFunction = (x) => 1 - Math.pow(1 - x, 3);

export const easings = {
  linear,
  easeInCubic,
  easeOutCubic,
};
