import * as React from 'react';
import { Input, Label } from 'client';

/** The login form's email field — Input is always paired with a Label. */
export const WithLabel = () => (
  <div className="w-80 space-y-1 p-6">
    <Label htmlFor="email">אימייל</Label>
    <Input id="email" type="email" defaultValue="dana@poligon.co.il" />
  </div>
);

export const Types = () => (
  <div className="w-80 space-y-4 p-6">
    <div className="space-y-1">
      <Label htmlFor="name">שם הלקוח</Label>
      <Input id="name" defaultValue="דנה שפירא" />
    </div>
    <div className="space-y-1">
      <Label htmlFor="phone">טלפון</Label>
      <Input id="phone" type="tel" placeholder="050-0000000" />
    </div>
  </div>
);

export const States = () => (
  <div className="w-80 space-y-4 p-6">
    <Input placeholder="הקלד שם לחיפוש" />
    <Input defaultValue="דנה שפירא" />
    <Input defaultValue="לא ניתן לעריכה" disabled />
  </div>
);
