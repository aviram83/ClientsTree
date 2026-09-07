import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'client';

/**
 * SelectValue shows the selected item's label, or `placeholder` when nothing is
 * chosen. It has no styling of its own — it lives inside SelectTrigger.
 */
export const SelectedVsPlaceholder = () => (
  <div className="w-80 space-y-3 p-6">
    <Select defaultValue="CLIENT_VIP">
      <SelectTrigger>
        <SelectValue placeholder="בחר סטטוס" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CLIENT_VIP">לקוח VIP</SelectItem>
      </SelectContent>
    </Select>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="בחר סטטוס" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CLIENT_VIP">לקוח VIP</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
