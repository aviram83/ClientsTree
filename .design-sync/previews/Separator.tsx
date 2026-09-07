import * as React from 'react';
import { Separator } from 'client';

export const Horizontal = () => (
  <div className="w-80 p-6">
    <p className="text-sm font-medium">פרטי הלקוח</p>
    <Separator className="my-3" />
    <p className="text-sm text-muted-foreground">דנה שפירא · לקוח VIP · 42% הנחה</p>
  </div>
);

export const Vertical = () => (
  <div className="flex h-10 items-center gap-3 p-6 text-sm">
    <span>עץ הלקוחות</span>
    <Separator orientation="vertical" />
    <span>ניקוד אישי</span>
    <Separator orientation="vertical" />
    <span>ניקוד מפקחים</span>
  </div>
);
