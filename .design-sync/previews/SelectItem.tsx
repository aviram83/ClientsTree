import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'client';

/**
 * SelectItem is one option. The selected item renders a check on the RTL
 * leading edge; a disabled item stays visible but is not choosable.
 */
export const Options = () => (
  <div className="h-80 w-80 p-6">
    <Select defaultValue="CLIENT_VIP" defaultOpen>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CLIENT">לקוח</SelectItem>
        <SelectItem value="CLIENT_VIP">לקוח VIP</SelectItem>
        <SelectItem value="DISTRIBUTOR">מפיץ</SelectItem>
        <SelectItem value="SUPERVISOR" disabled>
          מפקח (דורש הרשאה)
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
);
