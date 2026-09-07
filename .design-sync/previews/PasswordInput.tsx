import * as React from 'react';
import { PasswordInput, Label } from 'client';

/**
 * The login and reset-password forms' password field: an Input with a
 * show/hide toggle rendered on the RTL trailing edge.
 */
export const WithLabel = () => (
  <div className="w-80 space-y-1 p-6">
    <Label htmlFor="password">סיסמה</Label>
    <PasswordInput id="password" defaultValue="סיסמה-לדוגמה" />
  </div>
);

export const Empty = () => (
  <div className="w-80 space-y-1 p-6">
    <Label htmlFor="new-password">סיסמה חדשה</Label>
    <PasswordInput id="new-password" placeholder="לפחות 8 תווים" />
  </div>
);
