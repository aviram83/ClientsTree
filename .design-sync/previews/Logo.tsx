import * as React from 'react';
import { Logo } from 'client';

/** The Poligon mark: a teal triangle of three linked nodes plus the wordmark. */
export const WithWordmark = () => (
  <div className="p-8">
    <Logo />
  </div>
);

/** Mark only — what the collapsed mobile header uses. */
export const MarkOnly = () => (
  <div className="p-8">
    <Logo showWordmark={false} />
  </div>
);

/** `className` lands on the flex row, so spacing and scale are caller-controlled. */
export const InAppHeader = () => (
  <div className="w-96 p-6">
    <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
      <Logo />
      <span className="text-sm text-muted-foreground">עץ לקוחות</span>
    </div>
  </div>
);
