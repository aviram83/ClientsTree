import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from 'client';

const PORTRAIT = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%230d9488'/><circle cx='48' cy='36' r='17' fill='%23ffffff'/><path d='M14 96c0-19 15-30 34-30s34 11 34 30z' fill='%23ffffff'/></svg>";

/** Image first, initials as the fallback while it loads or when it is absent. */
export const WithImage = () => (
  <div className="flex items-center gap-4 p-6">
    <Avatar>
      <AvatarImage src={PORTRAIT} alt="דנה שפירא" />
      <AvatarFallback>דש</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <div className="font-medium">דנה שפירא</div>
      <div className="text-muted-foreground">לקוח VIP</div>
    </div>
  </div>
);

/** No image source — the fallback carries the client's Hebrew initials. */
export const InitialsOnly = () => (
  <div className="flex items-center gap-3 p-6">
    <Avatar>
      <AvatarFallback>אכ</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>עפ</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>שא</AvatarFallback>
    </Avatar>
  </div>
);
