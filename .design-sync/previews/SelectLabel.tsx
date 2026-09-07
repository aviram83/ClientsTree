import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator } from 'client';

/** SelectLabel is the non-selectable heading for a SelectGroup. It is indented to line up with the item labels, not with their check column. */
export const InSelect = () => (
  <div className="h-96 w-80 p-6">
    <Select defaultValue="LEVEL_2" defaultOpen>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>גג הבית</SelectLabel>
          <SelectItem value="LEVEL_0">מחיר מלא</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>חדרי הנחה</SelectLabel>
          <SelectItem value="LEVEL_1">15-25%</SelectItem>
          <SelectItem value="LEVEL_2">35%</SelectItem>
          <SelectItem value="LEVEL_3">42%</SelectItem>
          <SelectItem value="LEVEL_4">50%</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);
