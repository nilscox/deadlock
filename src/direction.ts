export enum Direction {
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
}

export function isDirection(value: string): value is Direction {
  return Object.values<string>(Direction).includes(value);
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
