import * as React from 'react';
import { WakeGate } from 'client';

/**
 * WakeGate covers Render's free-tier cold start: it probes /health on mount and
 * shows this branded splash until the server answers. In a preview no server
 * answers, so the splash is the state that renders — which is exactly the state
 * worth designing against. The pass-through (awake) state renders its children
 * unchanged and cannot be shown statically.
 */
export const ColdStartSplash = () => (
  <div className="relative h-[420px] w-full">
    <WakeGate>
      <div className="p-8">תוכן האפליקציה מוצג רק לאחר שהשרת ענה.</div>
    </WakeGate>
  </div>
);
