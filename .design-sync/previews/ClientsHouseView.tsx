import * as React from 'react';
import { ClientsHouseView } from 'client';

/**
 * "ניקוד אישי" — the Personal House. Same canvas as HouseView, filtered to
 * clients with no SUPERVISOR above them, plus supervisors that sit directly
 * under the root (depth 1).
 */
export const PersonalHouse = () => (
  <div style={{ width: 840, height: 660 }}>
    <ClientsHouseView />
  </div>
);
