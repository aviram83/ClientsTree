import { describe, it, expect } from 'vitest';
import he from './locales/he.json';
import en from './locales/en.json';

const flatten = (obj: Record<string, any>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null ? flatten(value, path) : [path];
  });

describe('locale key parity', () => {
  const heKeys = new Set(flatten(he));
  const enKeys = new Set(flatten(en));

  it('he.json and en.json have identical key sets', () => {
    const missingFromEn = [...heKeys].filter((k) => !enKeys.has(k));
    const missingFromHe = [...enKeys].filter((k) => !heKeys.has(k));
    expect(missingFromEn).toEqual([]);
    expect(missingFromHe).toEqual([]);
  });

  it('no key has an empty string value in either locale', () => {
    const getValue = (obj: Record<string, any>, path: string) =>
      path.split('.').reduce((acc, part) => acc?.[part], obj);

    heKeys.forEach((key) => {
      expect(getValue(he, key)).not.toBe('');
    });
    enKeys.forEach((key) => {
      expect(getValue(en, key)).not.toBe('');
    });
  });
});
