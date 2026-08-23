import { TreePine, Home, Settings, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry;

export const NAV_ITEMS: NavEntry[] = [
  { label: 'עץ לקוחות', path: '/dashboard', icon: TreePine },
  {
    label: 'בתים',
    icon: Home,
    children: [
      { label: 'ניקוד אישי', path: '/houses/clients', icon: Home },
      { label: 'ניקוד מפקחים', path: '/houses/supervisors', icon: Home },
    ],
  },
  { label: 'הגדרות', path: '/settings', icon: Settings },
];
