export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Clients Tree', path: '/dashboard' },
  { label: 'Clients House', path: '/clients-house' },
];
