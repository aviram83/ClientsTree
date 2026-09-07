import * as React from 'react';
import { Switch, Label } from 'client';

/** NodeForm's "active" toggle — the only place Switch is used in the product. */
export const ActiveToggle = () => (
  <div className="w-72 space-y-4 p-6">
    <div className="flex items-center justify-between">
      <Label htmlFor="active-on">פעיל</Label>
      <Switch id="active-on" defaultChecked />
    </div>
    <div className="flex items-center justify-between">
      <Label htmlFor="active-off">פעיל</Label>
      <Switch id="active-off" />
    </div>
    <div className="flex items-center justify-between opacity-60">
      <Label htmlFor="active-disabled">פעיל</Label>
      <Switch id="active-disabled" defaultChecked disabled />
    </div>
  </div>
);
