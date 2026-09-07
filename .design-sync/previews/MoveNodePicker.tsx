import * as React from 'react';
import { MoveNodePicker, DEMO_TREE, DEMO_NODE } from 'client';

const noop = () => {};

/**
 * The re-parenting picker that replaces NodeForm's body in place. It walks the
 * whole tree and greys out the node itself and its descendants as invalid
 * targets, and reports how many descendants move with it.
 */
export const PickTarget = () => (
  <div className="w-[460px] rounded-lg border bg-card p-6">
    <MoveNodePicker
      tree={DEMO_TREE}
      node={DEMO_NODE}
      isLoading={false}
      onCancel={noop}
      onConfirm={noop}
    />
  </div>
);

/** Moving a leaf: no descendants travel with it, so the warning line is absent. */
export const LeafNode = () => (
  <div className="w-[460px] rounded-lg border bg-card p-6">
    <MoveNodePicker
      tree={DEMO_TREE}
      node={DEMO_TREE[0].children[1]}
      isLoading={false}
      onCancel={noop}
      onConfirm={noop}
    />
  </div>
);

/** The confirm request in flight. */
export const Confirming = () => (
  <div className="w-[460px] rounded-lg border bg-card p-6">
    <MoveNodePicker
      tree={DEMO_TREE}
      node={DEMO_NODE}
      isLoading
      onCancel={noop}
      onConfirm={noop}
    />
  </div>
);
