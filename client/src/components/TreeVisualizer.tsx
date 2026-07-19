import React, { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from '@xyflow/react';
import CustomNode from './CustomNode';
import '@xyflow/react/dist/style.css';
import FloatingToolbar from './FloatingToolbar';
import { TreeNode } from '../api/types';
import type { Node, Edge } from '@xyflow/react';
import { buildFlowGraph, getLayoutedElements, CustomNodeData } from '../lib/treeLayout';

// Props for the TreeVisualizer component
interface TreeVisualizerProps {
  treeData: TreeNode[];
  onAddNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  activeCount: number;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ treeData, onAddNode, onEditNode, onDeleteNode, activeCount }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []) as any;

  useEffect(() => {
    if (treeData) {
      const { nodes: allNodes, edges: allEdges } = buildFlowGraph(treeData, searchQuery, {
        onAdd: onAddNode,
        onEdit: onEditNode,
        onDelete: onDeleteNode,
      });

      const layouted = getLayoutedElements(allNodes, allEdges, { direction: 'TB' });

      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    }
  }, [treeData, onAddNode, onEditNode, onDeleteNode, setNodes, setEdges, searchQuery]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Floating Toolbar: Search + Active Count + Legend */}
      <FloatingToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCount={activeCount}
      />

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
