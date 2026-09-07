import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, Button } from 'client';

/**
 * PopoverTrigger renders no markup of its own — pass `asChild` and give it the
 * real control (a Button here), which is how FloatingToolbar uses it.
 */
export const AsButton = () => (
  <div className="flex h-64 items-start gap-4 p-6">
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          מקרא
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 text-sm">
        המקרא נפתח מתוך הטריגר ומוצמד אליו.
      </PopoverContent>
    </Popover>
  </div>
);
