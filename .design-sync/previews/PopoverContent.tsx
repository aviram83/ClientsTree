import * as React from 'react';
import { Popover, PopoverTrigger, PopoverContent, Button, Separator } from 'client';

/**
 * PopoverContent is portalled and positioned against its trigger, so it only
 * exists while the Popover is open — `defaultOpen` renders it statically here.
 */
export const Open = () => (
  <div className="flex h-72 items-start justify-center p-6">
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">פרטי הלקוח</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-2">
        <p className="text-sm font-medium">דנה שפירא</p>
        <Separator />
        <p className="text-sm text-muted-foreground">
          לקוח VIP · 42% הנחה · שלושה לקוחות מתחת
        </p>
      </PopoverContent>
    </Popover>
  </div>
);
