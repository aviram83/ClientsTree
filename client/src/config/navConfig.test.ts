import { describe, it, expect } from 'vitest';
import { TreePine, Home } from 'lucide-react';
import { isNavGroup, NavEntry, NAV_ITEMS } from './navConfig';
import he from '../i18n/locales/he.json';
import en from '../i18n/locales/en.json';

describe('isNavGroup', () => {
  it('returns false for a plain NavItem', () => {
    const item: NavEntry = { labelKey: 'nav.tree', path: '/dashboard', icon: TreePine };
    expect(isNavGroup(item)).toBe(false);
  });

  it('returns true for a NavGroup', () => {
    const group: NavEntry = {
      labelKey: 'nav.houses',
      icon: Home,
      children: [{ labelKey: 'nav.personalHouse', path: '/houses/clients', icon: Home }],
    };
    expect(isNavGroup(group)).toBe(true);
  });
});

const getKey = (dict: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, part) => acc?.[part], dict);

describe('NAV_ITEMS translations', () => {
  const allLabelKeys: string[] = [];
  NAV_ITEMS.forEach((entry) => {
    allLabelKeys.push(entry.labelKey);
    if (isNavGroup(entry)) {
      entry.children.forEach((child) => allLabelKeys.push(child.labelKey));
    }
  });

  it('every labelKey resolves to a truthy value in both locales', () => {
    allLabelKeys.forEach((key) => {
      expect(getKey(he, key)).toBeTruthy();
      expect(getKey(en, key)).toBeTruthy();
    });
  });
});
