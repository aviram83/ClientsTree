import * as React from 'react';
import { NodeForm, DEMO_TREE, DEMO_NODE } from 'client';

const noop = () => {};

/** Add mode — DashboardPage opens this from a node's "+" with no `node` prop. */
export const AddClient = () => (
  <div className="w-[420px] rounded-lg border bg-card p-6">
    <NodeForm onSubmit={noop} onClose={noop} isLoading={false} />
  </div>
);

/**
 * Edit mode — `tree` + `onMove` are what make the destructive "Move…" button
 * appear, so this is the composition that shows the form's full surface.
 */
export const EditClient = () => (
  <div className="w-[420px] rounded-lg border bg-card p-6">
    <NodeForm
      onSubmit={noop}
      onClose={noop}
      isLoading={false}
      node={DEMO_NODE}
      tree={DEMO_TREE}
      onMove={noop}
    />
  </div>
);

/** In-flight save: the submit button reports progress and locks the form. */
export const Saving = () => (
  <div className="w-[420px] rounded-lg border bg-card p-6">
    <NodeForm onSubmit={noop} onClose={noop} isLoading node={DEMO_NODE} />
  </div>
);
