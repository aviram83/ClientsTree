import * as React from 'react';
import { Textarea, Label } from 'client';

/** NodeForm's description field. */
export const WithLabel = () => (
  <div className="w-96 space-y-1 p-6">
    <Label htmlFor="description">תיאור</Label>
    <Textarea
      id="description"
      defaultValue={'לקוחה ותיקה, מזמינה כל רבעון.\nמעדיפה משלוח לסניף הרצליה.'}
      rows={4}
    />
  </div>
);

export const States = () => (
  <div className="w-96 space-y-4 p-6">
    <Textarea placeholder="הוסף הערה על הלקוח" rows={3} />
    <Textarea defaultValue="הערה נעולה לעריכה" rows={3} disabled />
  </div>
);
