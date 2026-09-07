import * as React from 'react';
import { Label, Input, Switch, Checkbox } from 'client';

/** Label is `htmlFor`-bound; clicking it focuses or toggles its control. */
export const WithControls = () => (
  <div className="w-80 space-y-5 p-6">
    <div className="space-y-1">
      <Label htmlFor="node-name">שם הלקוח</Label>
      <Input id="node-name" defaultValue="עמית פרץ" />
    </div>
    <div className="flex items-center gap-2">
      <Switch id="node-active" defaultChecked />
      <Label htmlFor="node-active">פעיל</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="node-terms" defaultChecked />
      <Label htmlFor="node-terms">אני מאשר את תנאי השימוש</Label>
    </div>
  </div>
);
