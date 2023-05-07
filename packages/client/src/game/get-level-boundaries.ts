import { Direction, IPoint, Point, max, min } from '@deadlock/game';

export const getLevelBoundaries = (cells: IPoint[]) => {
  const map = new Set(cells.map(({ x, y }) => `${x},${y}`));
  const visited = new Set<string>();

  const p = new Point(cells[0]);
  const boundaries: IPoint[] = [];
  let dir: Direction | undefined = Direction.right;

  const hasHorizontalEdge = (p: Point) => {
    const up = map.has(`${p.x},${p.y - 1}`);
    const down = map.has(`${p.x},${p.y}`);

    return (up && !down) || (!up && down);
  };

  const hasVerticalEdge = (p: Point) => {
    const left = map.has(`${p.x - 1},${p.y}`);
    const right = map.has(`${p.x},${p.y}`);

    return (left && !right) || (right && !left);
  };

  const canGo = (dir: Direction) => {
    if (p.move(dir).equals(boundaries[0])) {
      return true;
    }

    if (wasVisited(p.move(dir))) {
      return false;
    }

    return {
      [Direction.right]: hasHorizontalEdge(p),
      [Direction.down]: hasVerticalEdge(p),
      [Direction.left]: hasHorizontalEdge(p.add(-1, 0)),
      [Direction.up]: hasVerticalEdge(p.add(0, -1)),
    }[dir];
  };

  const wasVisited = (point: Point) => {
    return visited.has(`${point.x},${point.y}`);
  };

  do {
    boundaries.push({ x: p.x, y: p.y });

    while (canGo(dir)) {
      p.set(p.move(dir));
    }

    const last = boundaries[boundaries.length - 1];

    for (let x = min([last.x, p.x]); x <= max([last.x, p.x]); ++x) {
      for (let y = min([last.y, p.y]); y <= max([last.y, p.y]); ++y) {
        visited.add(`${x},${y}`);
      }
    }

    dir = Direction.right;

    while (dir && !canGo(dir)) {
      dir = nextDirection(dir);
    }
  } while (dir);

  return boundaries;
};

const cycle = [Direction.right, Direction.down, Direction.left, Direction.up];

const nextDirection = (dir: Direction): Direction | undefined => {
  const index = cycle.indexOf(dir);
  return cycle[index + 1];
};
