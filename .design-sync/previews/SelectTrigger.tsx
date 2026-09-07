import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'client';

/**
 * SelectTrigger is the closed control: it draws the border and the chevron, and
 * must wrap a SelectValue, which is what displays the current selection.
 */
export const EnabledAndDisabled = () => (
  <div className="w-80 space-y-3 p-6">
    <Select defaultValue="CLIENT">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CLIENT">לקוח</SelectItem>
        <SelectItem value="SUPERVISOR">מפקח</SelectItem>
      </SelectContent>
    </Select>
    <Select disabled defaultValue="SUPERVISOR">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SUPERVISOR">מפקח</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
