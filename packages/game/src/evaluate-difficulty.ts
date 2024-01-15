import { Node, getNodes, getWinningPaths, graph } from './graph';
import { Level, LevelDefinition } from './level';
import { defined } from './utils/assert';
import { sum } from './utils/math';

export function evaluateLevelDifficulty(def: LevelDefinition) {
  const node = graph(Level.load(def));
  const height = Math.max(...getNodes(node).map((node) => node.height));

  const nodesDifficulty = computeNodesDifficulty(node, height);
  const winningPaths = getWinningPaths(node);

  const pathsDifficulty = winningPaths.map((path) =>
    sum(path.map((node) => defined(nodesDifficulty.get(node))))
  );

  return Math.min(...pathsDifficulty) / (def.width * def.height);
}

function computeNodesDifficulty(node: Node, height: number, map = new Map<Node, number>()) {
  const children = Object.values(node.children);

  for (const child of children) {
    computeNodesDifficulty(child, height, map);
  }

  if (children.length <= 1) {
    map.set(node, 0);
  } else {
    const invHeight = height - node.height;
    const nbChoices = children.length - 1;
    map.set(node, Math.pow(2, nbChoices) * invHeight);
  }

  return map;
}
