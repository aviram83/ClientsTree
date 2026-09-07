import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'client';

const YEARS = Array.from({ length: 24 }, (_, i) => 2003 + i);

/**
 * SelectScrollDownButton is the chevron strip pinned to the bottom of an overflowing SelectContent.
 *
 * You never place it yourself: SelectContent already renders both scroll
 * buttons around its viewport. It only becomes visible once the option list is
 * taller than the popup, which is what the capped height and long list below
 * force.
 */
export const LongList = () => (
  <div className="h-96 w-80 p-6">
    <Select defaultValue="2014" defaultOpen>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-56">
        {YEARS.map((y) => (
          <SelectItem key={y} value={String(y)}>
            שנת הצטרפות {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
