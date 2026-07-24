import dagre from 'dagre';
import { MarkerType } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { TreeNode } from '../api/types';

// Define the size of your CustomNode here.
// If using Tailwind w-64 (16rem = 256px), match it here.
export const NODE_WIDTH = 120;
export const NODE_HEIGHT = 120;

// Type for the data property within our custom node
export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  status: string;
  id: string;
  active: boolean;
  parentId: string | null;
  isDimmed: boolean;
}

export const getLayoutedElements = (
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  options: { direction: string }
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } => {
  const g = new dagre.graphlib.Graph();

  // 'nodesep' is the horizontal space between siblings
  // 'ranksep' is the vertical gap between levels
  g.setGraph({ rankdir: options.direction, nodesep: 50, ranksep: 100 });

  g.setDefaultEdgeLabel(() => ({}));

  // 1. Set Edges (Order matters for Left-to-Right positioning)
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // 2. Set Nodes with explicit Dimensions
  nodes.forEach((node) => {
    // You must provide width/height so Dagre knows how much space to reserve
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // 3. Calculate Layout
  dagre.layout(g);

  // 4. Map back to React Flow (Center -> Top-Left conversion)
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);

    return {
      ...node,
      position: {
        // Shift x by half width, y by half height
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Walks the tree, producing React Flow nodes/edges (unlayouted, position {0,0}).
// Children are ordered newest-first so Dagre places the newest child on the left.
export const buildFlowGraph = (
  treeData: TreeNode[],
  searchQuery: string
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } => {
  const allNodes: Node<CustomNodeData>[] = [];
  const allEdges: Edge[] = [];

  const processNode = (node: TreeNode) => {
    allNodes.push({
      id: node.id,
      type: 'custom',
      data: {
        label: node.name,
        status: node.status,
        id: node.id,
        active: node.active,
        parentId: node.parentId,
        isDimmed: searchQuery !== '' && !node.name.toLowerCase().includes(searchQuery.toLowerCase()),
      },
      position: { x: 0, y: 0 }, // Position will be set by Dagre
    });

    if (node.children) {
      // Sort DESCENDING (Newest first) so the newest child's edge is added first,
      // and Dagre therefore places that child on the LEFT.
      const sortedChildren = [...node.children].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      sortedChildren.forEach((child) => {
        allEdges.push({
          id: `e-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: 'smoothstep',
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--muted-foreground))' },
        });

        processNode(child);
      });
    }
  };

  treeData.forEach(processNode);

  return { nodes: allNodes, edges: allEdges };
};
