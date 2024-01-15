import { CellType, Level, LevelMap } from './level';
import { Player } from './player';
import { Direction, directions } from './utils/direction';
import { IPoint } from './utils/point';

export type Node = {
  map: LevelMap;
  win: boolean;
  height: number;
  children: Partial<Record<Direction, Node>>;
};

export function graph(
  level: Level,
  player = new Player(level.start),
  nodes = new Map<string, Node>(),
  height = 0
): Node {
  const children: Node['children'] = {};

  for (const dir of directions) {
    if (!level.movePlayer(player, dir)) {
      continue;
    }

    children[dir] = graph(level, player, nodes, height + 1);

    level.movePlayerBack(player);
  }

  const node: Node = {
    map: level.map.clone(),
    win: level.map.cells(CellType.empty).length === 0,
    height,
    children,
  };

  if (Object.values(children).some((child) => child?.win)) {
    node.win = true;
  }

  const hash = nodeHash(node);
  const existing = nodes.get(hash);

  if (existing) {
    return existing;
  }

  nodes.set(hash, node);

  return node;
}

function nodeHash(node: Node) {
  const [player] = node.map.cells(CellType.player);
  const path = node.map.cells(CellType.path);

  return [
    //
    ...path.sort(comparePoints).map(({ x, y }) => [x, y].join(',')),
    `${player.x},${player.y}`,
  ].join(';');
}

function comparePoints(a: IPoint, b: IPoint) {
  return a.x !== b.x || a.y !== b.y ? -1 : 0;
}

export function getNodes(node: Node): Node[] {
  return [node, ...Object.values(node.children).flatMap(getNodes)];
}

export function getPaths(node: Node): Node[][] {
  const children = Object.values(node.children);

  if (children.length === 0) {
    return [[node]];
  }

  return children.flatMap(getPaths).map((path) => [node, ...path]);
}

export function getWinningPaths(node: Node): Node[][] {
  return getPaths(node).filter((path) => path[path.length - 1].win);
}
