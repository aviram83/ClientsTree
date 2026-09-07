import * as React from 'react';
import { TreeNode, DEMO_TREE } from 'client';

/**
 * The non-canvas rendering of a branch: a nested list with per-node add/edit/
 * delete actions, backed by the tree store.
 */
export const Branch = () => (
  <ul className="w-[420px] p-6">
    <TreeNode node={DEMO_TREE[0]} />
  </ul>
);

/** A leaf client — same component, no children to expand. */
export const Leaf = () => (
  <ul className="w-[420px] p-6">
    <TreeNode node={DEMO_TREE[0].children[1]} />
  </ul>
);
