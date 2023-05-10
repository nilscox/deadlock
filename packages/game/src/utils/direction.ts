export enum Direction {
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
}

export const directions = Object.values(Direction);

export type Path = Direction[];

export function isDirection(value: string): value is Direction {
  return Object.values<string>(Direction).includes(value);
}

export function isHorizontal(dir: Direction): dir is Direction.left | Direction.right {
  return dir === Direction.left || dir === Direction.right;
}

export function isVertical(dir: Direction): dir is Direction.up | Direction.down {
  return dir === Direction.up || dir === Direction.down;
}

export function getOppositeDirection(dir: Direction): Direction {
  return {
    [Direction.left]: Direction.right,
    [Direction.right]: Direction.left,
    [Direction.up]: Direction.down,
    [Direction.down]: Direction.up,
  }[dir];
}

const directionsMap: Record<Direction, [number, number]> = {
  [Direction.left]: [-1, 0],
  [Direction.right]: [1, 0],
  [Direction.up]: [0, -1],
  [Direction.down]: [0, 1],
};

export function getDirectionVector(direction: Direction): [number, number] {
  return directionsMap[direction];
}
