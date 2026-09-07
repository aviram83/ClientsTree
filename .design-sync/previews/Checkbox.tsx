import * as React from 'react';
import { Checkbox, Label } from 'client';

export const States = () => (
  <div className="w-80 space-y-3 p-6">
    <div className="flex items-center gap-2">
      <Checkbox id="cb-on" defaultChecked />
      <Label htmlFor="cb-on">הצג לקוחות לא פעילים</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-off" />
      <Label htmlFor="cb-off">הצג רק מפקחים</Label>
    </div>
    <div className="flex items-center gap-2 opacity-60">
      <Checkbox id="cb-disabled" defaultChecked disabled />
      <Label htmlFor="cb-disabled">אני מאשר את תנאי השימוש</Label>
    </div>
  </div>
);
