import { LevelDescription } from './level';
import { Point } from './point';
import { randBool, randItem } from './utils';

export const randomTransformLevel = (level: LevelDescription) => {
  if (randBool()) {
    mirrorH(level);
  }

  if (randBool()) {
    mirrorV(level);
  }

  rotate(level, randItem(angles));

  normalize(level);
};

const normalize = (level: LevelDescription) => {
  let minX = level[0].x;
  let minY = level[0].y;
  let maxX = level[0].x;
  let maxY = level[0].y;

  for (const cell of level) {
    if (cell.x < minX) minX = cell.x;
    if (cell.y < minY) minY = cell.y;
    if (cell.x > maxX) maxX = cell.x;
    if (cell.y > maxY) maxY = cell.y;
  }

  for (const cell of level) {
    cell.x -= minX;
    cell.y -= minY;
  }

  level.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
};

const mirrorH = (level: LevelDescription) => {
  for (const cell of level) {
    cell.x = -cell.x;
  }
};

const mirrorV = (level: LevelDescription) => {
  for (const cell of level) {
    cell.y = -cell.y;
  }
};

const rotate = (level: LevelDescription, angle: number) => {
  for (const cell of level) {
    const p = rotatePoint(new Point(cell), angle);
    cell.x = p.x;
    cell.y = p.y;
  }
};

const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

const rotatePoint = (point: Point, angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return new Point(Math.round(point.x * c - point.y * s), Math.round(point.x * s + point.y * c));
};
