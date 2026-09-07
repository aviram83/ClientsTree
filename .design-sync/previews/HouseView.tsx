import * as React from 'react';
import { HouseView } from 'client';

/**
 * The shared house canvas with no membership filter — every visible client in
 * the store's tree, placed on the roof (full price) or in the room matching its
 * discount level. HouseView reads the tree from the store, so it needs no props.
 */
export const AllClients = () => (
  <div style={{ width: 840, height: 660 }}>
    <HouseView />
  </div>
);
