import * as React from 'react';
import { HouseBackground } from 'client';

/**
 * The house itself: the roof band for full-price clients and the 2x2 grid of
 * discount rooms, each filled from the ascending-lightness scale keyed by
 * PercentageLevel. It draws the labels only — clients are separate HouseNodes
 * positioned over it.
 */
export const Rooms = () => (
  <div className="p-6">
    <HouseBackground />
  </div>
);
