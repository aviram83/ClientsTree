import { TreePine, Home, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Clients Tree', path: '/dashboard', icon: TreePine },
  { label: 'Clients House', path: '/clients-house', icon: Home },
];
