import { stratify, tree, HierarchyPointNode } from 'd3-hierarchy';
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

// --- d3-hierarchy (Reingold–Tilford) tree layout ---------------------------
// A true tree layout (not a general layered/Sugiyama graph layout): siblings
// pack tightly and a parent is never stranded over an empty "valley" between
// two bushy subtrees. Hierarchy is derived from each node's data.parentId.
//
// Horizontal gap tuning lives in SIBLING_GAP + the `separation` function below;
// vertical gap is NODE_HEIGHT + RANK_GAP.
const SIBLING_GAP = 80; // extra px between adjacent siblings (added to NODE_WIDTH)
const RANK_GAP = 100; // vertical gap between levels

export const getLayoutedElements = (
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  // `direction` kept for signature-compatibility with callers; the tree layout
  // is always top-to-bottom.
  _options: { direction: string }
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } => {
  if (nodes.length === 0) return { nodes, edges };

  const idSet = new Set(nodes.map((n) => n.id));
  const SYNTHETIC_ROOT = '__synthetic_root__';

  // Build stratify records. The data may be a forest (multiple real roots), but
  // d3.stratify requires exactly one root, so we parent every real root under a
  // synthetic root and strip it back out afterwards.
  const records = nodes.map((n) => {
    const parentId = n.data.parentId;
    const hasParentInSet = parentId != null && idSet.has(parentId);
    return { id: n.id, parentId: hasParentInSet ? parentId : SYNTHETIC_ROOT };
  });
  records.push({ id: SYNTHETIC_ROOT, parentId: '' });

  const root = stratify<{ id: string; parentId: string }>()
    .id((d) => d.id)
    .parentId((d) => (d.parentId === '' ? null : d.parentId))(records);

  // nodeSize: [horizontal span per node, vertical span per rank]. separation
  // returns a multiplier of the horizontal span: siblings sit one node apart,
  // cousins (different parents) get a little more breathing room.
  const layout = tree<{ id: string; parentId: string }>()
    .nodeSize([NODE_WIDTH + SIBLING_GAP, NODE_HEIGHT + RANK_GAP])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.25));

  const laidOut = layout(root);

  // Map id -> computed point, skipping the synthetic root. The synthetic root
  // occupies depth 0, so real roots land at depth 1; shift y up one rank so the
  // real roots sit at y = 0.
  const posById = new Map<string, { x: number; y: number }>();
  laidOut.each((d: HierarchyPointNode<{ id: string; parentId: string }>) => {
    if (d.data.id === SYNTHETIC_ROOT) return;
    posById.set(d.data.id, { x: d.x, y: d.y - (NODE_HEIGHT + RANK_GAP) });
  });

  const layoutedNodes = nodes.map((node) => {
    const p = posById.get(node.id) ?? { x: 0, y: 0 };
    return {
      ...node,
      // Center → top-left conversion (React Flow positions from the top-left).
      position: { x: p.x - NODE_WIDTH / 2, y: p.y - NODE_HEIGHT / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Walks the tree, producing React Flow nodes/edges (unlayouted, position {0,0}).
// Children are ordered newest-first so the newest child is placed on the left.
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
