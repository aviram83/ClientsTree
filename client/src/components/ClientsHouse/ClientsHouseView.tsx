import { useEffect, useMemo } from 'react';
import { ReactFlow, useNodesState, Controls, Background } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTreeStore } from '../../store/treeStore';
import HouseNode, { HouseNodeData } from './HouseNode';
import HouseBackground from './HouseBackground';
import {
  flattenVisibleHouseNodes,
  groupNodesByPercentageLevel,
  computeAdaptiveGridLayout,
  computeRoofGridLayout,
  HOUSE_SLOT_BOUNDS,
  HOUSE_WIDTH,
  HOUSE_HEIGHT,
} from '../../lib/houseLayout';
import { ROOM_LEVELS, PercentageLevel } from '../../config/percentageConfig';

const ClientsHouseView = () => {
  const tree = useTreeStore((s) => s.tree);
  const fetchTree = useTreeStore((s) => s.fetchTree);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<HouseNodeData | Record<string, never>>>([]);

  const nodeTypes = useMemo(() => ({ houseNode: HouseNode, houseBackground: HouseBackground }), []) as any;

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  useEffect(() => {
    const visibleNodes = flattenVisibleHouseNodes(tree);
    const grouped = groupNodesByPercentageLevel(visibleNodes);

    const backgroundNode: Node = {
      id: 'house-background',
      type: 'houseBackground',
      data: {},
      position: { x: 0, y: 0 },
      draggable: false,
      selectable: false,
      zIndex: -1,
      style: { width: HOUSE_WIDTH, height: HOUSE_HEIGHT },
    };

    const roofNodes = grouped[PercentageLevel.LEVEL_0] ?? [];
    const roofLayout = computeRoofGridLayout(roofNodes.length);
    const roofClientNodes: Node<HouseNodeData>[] = roofNodes.map((node, i) => ({
      id: node.id,
      type: 'houseNode',
      data: { label: node.name, size: roofLayout.nodeSize },
      position: roofLayout.positions[i],
      draggable: false,
      selectable: false,
    }));

    const roomClientNodes: Node<HouseNodeData>[] = ROOM_LEVELS.flatMap((level) => {
      const nodesInLevel = grouped[level] ?? [];
      const bounds = HOUSE_SLOT_BOUNDS[level];
      const { positions, nodeSize } = computeAdaptiveGridLayout(nodesInLevel.length, bounds);

      return nodesInLevel.map((node, i) => ({
        id: node.id,
        type: 'houseNode',
        data: { label: node.name, size: nodeSize },
        position: positions[i],
        draggable: false,
        selectable: false,
      }));
    });

    const clientNodes = [...roofClientNodes, ...roomClientNodes];

    setNodes([backgroundNode, ...clientNodes]);
  }, [tree, setNodes]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        onInit={(instance) => instance.fitView({ padding: 0.2 })}
        minZoom={0.2}
        maxZoom={2}
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

export default ClientsHouseView;
