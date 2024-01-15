import { CellType, Direction, GraphNode, IPoint, Level, LevelDefinition, graph } from '@deadlock/game';
import { Digraph, Edge, Node } from '@nilscox/graphviz-react';
import { useMemo } from 'react';

type GraphProps = {
  definition: LevelDefinition;
};

export function LevelGraph({ definition }: GraphProps) {
  const root = useMemo(() => graph(Level.load(definition)), [definition]);
  const nodes = useMemo(() => getNodesList(root), [root]);
  const edges = useMemo(() => getEdgesList(root), [root]);

  if (nodes.length > 3000) {
    return <>Garph too large ({nodes.length} nodes)</>;
  }

  return (
    <Digraph className="overflow-auto" attributes={{ rankdir: 'TB', nodesep: 0.25 }}>
      {nodes.map((node) => (
        <Node
          key={nodeHash(node)}
          id={nodeHash(node)}
          shape="point"
          color={node.win ? 'forestgreen' : undefined}
        />
      ))}

      {edges.map(([dir, from, to]) => (
        <Edge
          key={nodeHash(from) + nodeHash(to)}
          targets={[nodeHash(from), nodeHash(to)]}
          color={to.win ? 'forestgreen' : undefined}
          arrowsize={0.25}
          // label={arrows[dir]}
        />
      ))}
    </Digraph>
  );
}

function getNodesList(node: GraphNode, visited = new Set<GraphNode>()): Array<GraphNode> {
  if (visited.has(node)) {
    return [];
  }

  visited.add(node);

  return [node, ...Object.values(node.children).flatMap((children) => getNodesList(children, visited))];
}

function getEdgesList(
  node: GraphNode,
  visited = new Set<GraphNode>()
): Array<[Direction, GraphNode, GraphNode]> {
  if (visited.has(node)) {
    return [];
  }

  visited.add(node);

  return [
    ...Object.entries(node.children).map(
      ([dir, child]) => [dir as Direction, node, child] satisfies [unknown, unknown, unknown]
    ),
    ...Object.values(node.children).flatMap((child) => getEdgesList(child, visited)),
  ];
}

function nodeHash(node: GraphNode) {
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

const arrows: Record<Direction, string> = {
  [Direction.up]: '🢁',
  [Direction.down]: '🢃',
  [Direction.left]: '🢀',
  [Direction.right]: '🢂',
};
