import * as React from 'react';
import { SupervisorHouseView } from 'client';

/**
 * "ניקוד מפקחים" — the Supervisor House: every client that has a SUPERVISOR
 * ancestor, plus supervisors nested deeper than depth 1. The two houses
 * partition the tree; no client appears in both.
 */
export const SupervisorHouse = () => (
  <div style={{ width: 840, height: 660 }}>
    <SupervisorHouseView />
  </div>
);
