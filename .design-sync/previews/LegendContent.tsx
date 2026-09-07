import * as React from 'react';
import { LegendContent } from 'client';

/**
 * The status key shown inside FloatingToolbar's popover. It takes no props —
 * it renders straight from STATUS_CONFIG, so it stays in sync with the shapes
 * and colours CustomNode draws.
 */
export const Legend = () => (
  <div className="w-72 rounded-lg border bg-card p-4">
    <LegendContent />
  </div>
);
