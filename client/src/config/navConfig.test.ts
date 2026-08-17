import { describe, it, expect } from 'vitest';
import { TreePine, Home } from 'lucide-react';
import { isNavGroup, NavEntry } from './navConfig';

describe('isNavGroup', () => {
  it('returns false for a plain NavItem', () => {
    const item: NavEntry = { label: 'עץ לקוחות', path: '/dashboard', icon: TreePine };
    expect(isNavGroup(item)).toBe(false);
  });

  it('returns true for a NavGroup', () => {
    const group: NavEntry = {
      label: 'בתים',
      icon: Home,
      children: [{ label: 'ניקוד לקוחות', path: '/houses/clients', icon: Home }],
    };
    expect(isNavGroup(group)).toBe(true);
  });
});
