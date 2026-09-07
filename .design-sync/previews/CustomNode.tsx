import * as React from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import { CustomNode } from 'client';

const nodeTypes = { custom: CustomNode };

const mk = (id: string, label: string, status: string, x: number, active = true, parentId: string | null = 'root') => ({
  id,
  type: 'custom',
  position: { x, y: 40 },
  data: { id, label, status, active, parentId, isDimmed: false },
});

/**
 * One node per status — the shape carries the meaning: CLIENT is a circle,
 * CLIENT_VIP a diamond, DISTRIBUTOR a hexagon, SUPERVISOR a square. CustomNode
 * draws React Flow Handles, so it only renders inside a ReactFlow canvas.
 */
export const Shapes = () => (
  <div style={{ width: 760, height: 260 }}>
    <ReactFlow
      nodes={[
        mk('n1', 'שירה אזולאי', 'CLIENT', 40),
        mk('n2', 'דנה שפירא', 'CLIENT_VIP', 220),
        mk('n3', 'עמית פרץ', 'DISTRIBUTOR', 400),
        mk('n4', 'אבי כהן', 'SUPERVISOR', 580),
      ]}
      edges={[]}
      nodeTypes={nodeTypes}
      fitView
      nodesDraggable={false}
    >
      <Background />
    </ReactFlow>
  </div>
);

/** Inactive clients keep their shape but swap to the grey fill with a status-coloured rim. */
export const ActiveVsInactive = () => (
  <div style={{ width: 680, height: 240 }}>
    <ReactFlow
      nodes={[
        mk('a1', 'רון ברקוביץ', 'CLIENT', 60),
        mk('a2', 'ליאור אדרי', 'CLIENT', 260, false),
      ]}
      edges={[]}
      nodeTypes={nodeTypes}
      fitView
      nodesDraggable={false}
    >
      <Background />
    </ReactFlow>
  </div>
);

/** The root node has `parentId: null` — it renders without the incoming handle. */
export const RootNode = () => (
  <div style={{ width: 560, height: 220 }}>
    <ReactFlow
      nodes={[mk('root', 'פוליגון', 'DISTRIBUTOR', 60, true, null)]}
      edges={[]}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.45 }}
      nodesDraggable={false}
    >
      <Background />
    </ReactFlow>
  </div>
);
