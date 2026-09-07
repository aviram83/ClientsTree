import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from 'client';

const PORTRAIT = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%230d9488'/><circle cx='48' cy='36' r='17' fill='%23ffffff'/><path d='M14 96c0-19 15-30 34-30s34 11 34 30z' fill='%23ffffff'/></svg>";

/**
 * AvatarImage only renders once the source resolves — it must always be paired
 * with an AvatarFallback inside an Avatar, which is what shows until then.
 */
export const InAvatar = () => (
  <div className="flex items-center gap-4 p-6">
    <Avatar>
      <AvatarImage src={PORTRAIT} alt="דנה שפירא" />
      <AvatarFallback>דש</AvatarFallback>
    </Avatar>
    <span className="text-sm font-medium">דנה שפירא</span>
  </div>
);
