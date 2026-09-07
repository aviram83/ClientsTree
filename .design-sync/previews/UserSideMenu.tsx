import * as React from 'react';
import { UserSideMenu } from 'client';

const noop = () => {};

/**
 * The app's navigation drawer. It reads the current route from the router to
 * mark the active item and renders `nav.houses` as an expandable group. When
 * `isOpen` is false the drawer translates off-canvas — there is nothing to
 * show in that state, so only the open one is previewed.
 */
export const Open = () => (
  <div className="relative h-[560px] w-full overflow-hidden">
    <UserSideMenu isOpen onClose={noop} onLogout={noop} />
  </div>
);
