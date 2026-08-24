import { describe, it, expect } from 'vitest';
import { ClientStatus, STATUS_CONFIG } from './statusConfig';
import he from '../i18n/locales/he.json';
import en from '../i18n/locales/en.json';

const getKey = (dict: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, part) => acc?.[part], dict);

describe('STATUS_CONFIG', () => {
  it('has a config entry for every ClientStatus value', () => {
    Object.values(ClientStatus).forEach((status) => {
      expect(STATUS_CONFIG[status]).toBeDefined();
    });
  });

  it('every entry has a labelKey present in both locales, plus color classes', () => {
    Object.values(STATUS_CONFIG).forEach((entry) => {
      expect(entry.labelKey).toBeTruthy();
      expect(getKey(he, entry.labelKey)).toBeTruthy();
      expect(getKey(en, entry.labelKey)).toBeTruthy();
      expect(entry.colorClass).toBeTruthy();
      expect(entry.inactiveColorClass).toBeTruthy();
      expect(entry.cssVar).toBeTruthy();
    });
  });
});
