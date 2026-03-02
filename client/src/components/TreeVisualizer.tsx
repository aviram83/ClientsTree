import React, { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
} from '@xyflow/react';
import dagre from 'dagre';
import CustomNode from './CustomNode';
import '@xyflow/react/dist/style.css';
import SearchBar from './SearchBar';
import StatusLegend from './StatusLegend';
import { TreeNode } from '../api/types';
import type { Node, Edge } from '@xyflow/react';

// Define the size of your CustomNode here. 
// If using Tailwind w-64 (16rem = 256px), match it here.
const NODE_WIDTH = 120;
const NODE_HEIGHT = 120;

// Type for the data property within our custom node
interface CustomNodeData extends Record<string, unknown> {
  label: string;
  status: string;
  id: string;
  active: boolean;
  parentId: string | null;
  onAdd: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  isDimmed: boolean;
}

// Props for the TreeVisualizer component
interface TreeVisualizerProps {
  treeData: TreeNode[];
  onAddNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
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

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ treeData, onAddNode, onEditNode, onDeleteNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []) as any;

  useEffect(() => {
    if (treeData) {
      const allNodes: Node<CustomNodeData>[] = [];
      const allEdges: Edge[] = [];

      const processNode = (node: TreeNode) => {
        // Add current node to the list for React Flow
        allNodes.push({
          id: node.id,
          type: 'custom',
          data: {
            label: node.name,
            status: node.status,
            id: node.id,
            active: node.active,
            parentId: node.parentId,
            onAdd: onAddNode,
            onEdit: onEditNode,
            onDelete: onDeleteNode,
            isDimmed: searchQuery !== '' && !node.name.toLowerCase().includes(searchQuery.toLowerCase()),
          },
          position: { x: 0, y: 0 }, // Position will be set by Dagre
        });

        if (node.children) {
          // 2. PREPARE THE ORDER
          // Sort DESCENDING (Newest first).
          // b.createdAt - a.createdAt
          const sortedChildren = [...node.children].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          // 3. GENERATE EDGES IN ORDER
          // Because 'sortedChildren' has the Newest item at index 0,
          // the loop adds the edge to the Newest child FIRST.
          // Dagre will therefore place that child on the LEFT.
          sortedChildren.forEach((child) => {
            allEdges.push({
              id: `e-${node.id}-${child.id}`,
              source: node.id,
              target: child.id,
              type: 'smoothstep',
              style: { stroke: '#464c53', strokeWidth: 3 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#464c53' },
            });

            // Recurse down this branch immediately
            processNode(child);
          });
        }
      };

      // Start processing from the root nodes, in their default order
      treeData.forEach(processNode);

      const layouted = getLayoutedElements(allNodes, allEdges, { direction: 'TB' });
      
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    }
  }, [treeData, onAddNode, onEditNode, onDeleteNode, setNodes, setEdges, searchQuery]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      {/* Status Legend */}
      <StatusLegend />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={(instance) => instance.fitView({ padding: 0.2, includeHiddenNodes: false })}
        minZoom={0.2}
        maxZoom={1.5}
        fitView={true}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default TreeVisualizer;