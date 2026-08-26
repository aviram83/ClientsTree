import { describe, it, expect } from 'vitest';
import { languageToDir } from './dirUtils';

describe('languageToDir', () => {
  it('maps he to rtl', () => {
    expect(languageToDir('he')).toBe('rtl');
  });

  it('maps en to ltr', () => {
    expect(languageToDir('en')).toBe('ltr');
  });

  it('falls back to rtl for undefined', () => {
    expect(languageToDir(undefined)).toBe('rtl');
  });

  it('falls back to rtl for an unknown language code', () => {
    expect(languageToDir('fr')).toBe('rtl');
  });
});
