import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'client';

/**
 * SelectContent is the portalled popup listing the options. It exists only
 * while the Select is open, so `defaultOpen` is what renders it statically.
 */
export const Open = () => (
  <div className="h-80 w-80 p-6">
    <Select defaultValue="LEVEL_2" defaultOpen>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="LEVEL_0">מחיר מלא</SelectItem>
        <SelectItem value="LEVEL_1">15-25%</SelectItem>
        <SelectItem value="LEVEL_2">35%</SelectItem>
        <SelectItem value="LEVEL_3">42%</SelectItem>
        <SelectItem value="LEVEL_4">50%</SelectItem>
        <SelectItem value="LEVEL_6">מוסתר (לא מוצג בבית)</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
