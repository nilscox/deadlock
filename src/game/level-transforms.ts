import { Level } from './level';
import { Point } from './point';
import { randBool, randItem } from './utils';

const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

export const randomTransformLevel = (level: Level) => {
  if (randBool()) {
    mirrorH(level);
  }

  if (randBool()) {
    mirrorV(level);
  }

  rotate(level, randItem(angles));

  normalize(level);
};

const mirrorH = (level: Level) => {
  for (const cell of level.cells()) {
    cell.position.x *= -1;
  }
};

const mirrorV = (level: Level) => {
  for (const cell of level.cells()) {
    cell.position.y *= -1;
  }
};

const rotate = (level: Level, angle: number) => {
  for (const cell of level.cells()) {
    rotatePoint(cell.position, angle);
  }
};

const rotatePoint = (point: Point, angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  point.set(Math.round(point.x * c - point.y * s), Math.round(point.x * s + point.y * c));
};

const normalize = (level: Level) => {
  const cells = level.serialize();
  const { min } = level.bounds;

  for (const cell of cells) {
    cell[0] -= min.x;
    cell[1] -= min.y;
  }

  cells.sort(([ax, ay], [bx, by]) => (ax === bx ? ay - by : ax - bx));

  level.load(cells);
};
