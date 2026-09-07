import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, Button, Separator } from 'client';

/**
 * FloatingToolbar's legend popover, opened. `defaultOpen` is what makes the
 * panel visible in a static card — in the product the trigger toggles it.
 */
export const LegendPopover = () => (
  <div className="flex h-72 items-start justify-center p-6">
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          מקרא
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 text-sm font-medium">סוגי לקוחות</p>
        <Separator className="mb-2" />
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-status-client" /> לקוח
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-status-client-vip" /> לקוח VIP
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-status-distributor" /> מפיץ
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-status-supervisor" /> מפקח
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  </div>
);

/** Closed — only the trigger is in the layout; the panel is portalled on open. */
export const Closed = () => (
  <div className="p-6">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          מקרא
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent>לא מוצג עד לפתיחה</PopoverContent>
    </Popover>
  </div>
);
