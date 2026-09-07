import * as React from 'react';
import { FloatingToolbar } from 'client';

/**
 * The pill that floats over the tree canvas: search on one half, the active
 * client count and the legend popover on the other. It is absolutely
 * positioned, so it needs a `relative` parent with real height.
 */
export const OverCanvas = () => {
  const [q, setQ] = React.useState('');
  return (
    <div className="relative h-40 w-full bg-muted/40">
      <FloatingToolbar searchQuery={q} setSearchQuery={setQ} activeCount={9} />
    </div>
  );
};

/** Searching: the query is live while the count keeps reporting the whole tree. */
export const WhileSearching = () => {
  const [q, setQ] = React.useState('כהן');
  return (
    <div className="relative h-40 w-full bg-muted/40">
      <FloatingToolbar searchQuery={q} setSearchQuery={setQ} activeCount={9} />
    </div>
  );
};
