import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from 'client';

/** NodeForm's status field, closed — the state the form is in most of the time. */
export const StatusClosed = () => (
  <div className="w-80 space-y-1 p-6">
    <Label>סטטוס</Label>
    <Select defaultValue="CLIENT_VIP">
      <SelectTrigger>
        <SelectValue placeholder="בחר סטטוס" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CLIENT">לקוח</SelectItem>
        <SelectItem value="CLIENT_VIP">לקוח VIP</SelectItem>
        <SelectItem value="DISTRIBUTOR">מפיץ</SelectItem>
        <SelectItem value="SUPERVISOR">מפקח</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

/** The same field open, showing the four statuses and the selected-item check. */
export const StatusOpen = () => (
  <div className="h-80 w-80 space-y-1 p-6">
    <Label>סטטוס</Label>
    <Select defaultValue="DISTRIBUTOR" defaultOpen>
      <SelectTrigger>
        <SelectValue placeholder="בחר סטטוס" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CLIENT">לקוח</SelectItem>
        <SelectItem value="CLIENT_VIP">לקוח VIP</SelectItem>
        <SelectItem value="DISTRIBUTOR">מפיץ</SelectItem>
        <SelectItem value="SUPERVISOR">מפקח</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

/** Nothing chosen yet — SelectValue falls back to its placeholder. */
export const Placeholder = () => (
  <div className="w-80 space-y-1 p-6">
    <Label>אחוז הנחה</Label>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="בחר רמת הנחה" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="LEVEL_0">מחיר מלא</SelectItem>
        <SelectItem value="LEVEL_4">50%</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
