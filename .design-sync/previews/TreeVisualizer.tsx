import * as React from 'react';
import { TreeVisualizer, DEMO_TREE } from 'client';

/**
 * The dashboard's whole canvas: a d3-hierarchy layout of the client tree drawn
 * with React Flow, with FloatingToolbar pinned over it. It sizes to its parent,
 * so it always needs a container with an explicit height.
 */
export const ClientTree = () => (
  <div style={{ width: 1040, height: 680 }} className="relative">
    <TreeVisualizer treeData={DEMO_TREE} activeCount={9} />
  </div>
);
