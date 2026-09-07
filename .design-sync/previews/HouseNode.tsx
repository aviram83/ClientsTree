import * as React from 'react';
import { HouseNode } from 'client';

/**
 * One client inside a house room: an identical black-bordered square for every
 * status — unlike CustomNode, the house never encodes status in the shape.
 */
export const Sizes = () => (
  <div className="flex items-end gap-6 p-8">
    <HouseNode data={{ label: 'דנה שפירא', size: 90 }} />
    <HouseNode data={{ label: 'עמית פרץ', size: 64 }} />
    <HouseNode data={{ label: 'נועה גל', size: 44 }} />
  </div>
);

/**
 * Below 30px the label would be unreadable, so the square renders bare and the
 * name moves to the title tooltip.
 */
export const BelowLabelThreshold = () => (
  <div className="flex items-end gap-6 p-8">
    <HouseNode data={{ label: 'איתי רוזן', size: 34 }} />
    <HouseNode data={{ label: 'איתי רוזן', size: 24 }} />
  </div>
);

/** Long Hebrew names wrap onto the two lines the square allows. */
export const LongName = () => (
  <div className="flex items-end gap-6 p-8">
    <HouseNode data={{ label: 'תמר בן דוד', size: 96 }} />
    <HouseNode data={{ label: 'רון ברקוביץ', size: 96 }} />
  </div>
);
