import * as React from 'react';
import { Avatar, AvatarFallback } from 'client';

/**
 * AvatarFallback is what the product actually shows: ClientsTree stores no
 * client photos, so every avatar resolves to Hebrew initials on the muted
 * surface colour.
 */
export const Initials = () => (
  <div className="flex items-center gap-3 p-6">
    <Avatar>
      <AvatarFallback>אכ</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>דש</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>ננ</AvatarFallback>
    </Avatar>
  </div>
);
