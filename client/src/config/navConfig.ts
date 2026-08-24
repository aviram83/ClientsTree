import { TreePine, Home, Settings, type LucideIcon } from 'lucide-react';

export interface NavItem {
  labelKey: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  labelKey: string;
  icon: LucideIcon;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry;

export const NAV_ITEMS: NavEntry[] = [
  { labelKey: 'nav.tree', path: '/dashboard', icon: TreePine },
  {
    labelKey: 'nav.houses',
    icon: Home,
    children: [
      { labelKey: 'nav.personalHouse', path: '/houses/clients', icon: Home },
      { labelKey: 'nav.supervisorHouse', path: '/houses/supervisors', icon: Home },
    ],
  },
  { labelKey: 'nav.settings', path: '/settings', icon: Settings },
];
