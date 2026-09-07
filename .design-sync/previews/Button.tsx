import * as React from 'react';
import { Plus, Trash, Search } from 'lucide-react';
import { Button } from 'client';

/** Every variant in the cva map, labelled as the product labels them. */
export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button>שמור</Button>
    <Button variant="secondary">חזור</Button>
    <Button variant="outline">בחר יעד</Button>
    <Button variant="ghost">סגור</Button>
    <Button variant="destructive">מחק לקוח</Button>
    <Button variant="link">שכחתי סיסמה</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button size="sm">קטן</Button>
    <Button size="default">רגיל</Button>
    <Button size="lg">גדול</Button>
    <Button size="icon" aria-label="הוסף לקוח">
      <Plus />
    </Button>
  </div>
);

/** Icons are auto-sized to 16px by the base class — no sizing props needed. */
export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button>
      <Plus />
      הוסף לקוח
    </Button>
    <Button variant="outline">
      <Search />
      חפש בעץ
    </Button>
    <Button variant="destructive">
      <Trash />
      מחק ענף
    </Button>
  </div>
);

export const States = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button disabled>שמור</Button>
    <Button variant="outline" disabled>
      בחר יעד
    </Button>
    <Button disabled>שומר…</Button>
  </div>
);

/** The login form's submit button: full width, disabled while the request runs. */
export const FullWidthSubmit = () => (
  <div className="w-80 p-6">
    <Button type="submit" className="w-full">
      התחבר
    </Button>
  </div>
);
