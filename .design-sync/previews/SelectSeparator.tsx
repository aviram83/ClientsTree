import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator } from 'client';

/** SelectSeparator is the thin rule between two SelectGroups. It takes no props and is never used outside SelectContent. */
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
