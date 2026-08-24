import { describe, it, expect } from 'vitest';
import { PercentageLevel, PERCENTAGE_LEVEL_CONFIG } from './percentageConfig';
import he from '../i18n/locales/he.json';
import en from '../i18n/locales/en.json';

const getKey = (dict: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, part) => acc?.[part], dict);

describe('PERCENTAGE_LEVEL_CONFIG', () => {
  it('has a config entry for every PercentageLevel value', () => {
    Object.values(PercentageLevel).forEach((level) => {
      expect(PERCENTAGE_LEVEL_CONFIG[level]).toBeDefined();
    });
  });

  it('every labelKey resolves to a truthy value in both locales', () => {
    Object.values(PercentageLevel).forEach((level) => {
      const { labelKey } = PERCENTAGE_LEVEL_CONFIG[level];
      expect(getKey(he, labelKey)).toBeTruthy();
      expect(getKey(en, labelKey)).toBeTruthy();
    });
  });
});
