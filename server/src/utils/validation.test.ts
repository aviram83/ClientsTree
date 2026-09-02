import { describe, it, expect } from 'vitest';
import { ClientStatus, PercentageLevel } from '@prisma/client';
import { isValidClientStatus, isValidPercentageLevel, sanitizeDescription, isValidLanguage, SUPPORTED_LANGUAGES } from './validation';

describe('isValidClientStatus', () => {
  it('accepts every ClientStatus enum value', () => {
    Object.values(ClientStatus).forEach(status => {
      expect(isValidClientStatus(status)).toBe(true);
    });
  });

  it('rejects invalid strings', () => {
    expect(isValidClientStatus('NOT_A_STATUS')).toBe(false);
    expect(isValidClientStatus(undefined)).toBe(false);
    expect(isValidClientStatus(null)).toBe(false);
  });
});

describe('isValidPercentageLevel', () => {
  it('accepts every PercentageLevel enum value', () => {
    Object.values(PercentageLevel).forEach(level => {
      expect(isValidPercentageLevel(level)).toBe(true);
    });
  });

  it('rejects invalid strings', () => {
    expect(isValidPercentageLevel('LEVEL_5')).toBe(false);
    expect(isValidPercentageLevel('NOT_A_LEVEL')).toBe(false);
    expect(isValidPercentageLevel(undefined)).toBe(false);
    expect(isValidPercentageLevel(null)).toBe(false);
  });
});

describe('sanitizeDescription', () => {
  it('escapes script tags', () => {
    expect(sanitizeDescription('<script>alert(1)</script>hello')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;hello',
    );
  });

  it('passes through safe text unchanged', () => {
    expect(sanitizeDescription('a normal description')).toBe('a normal description');
  });

  it('returns null for falsy input', () => {
    expect(sanitizeDescription(undefined)).toBeNull();
    expect(sanitizeDescription(null)).toBeNull();
    expect(sanitizeDescription('')).toBeNull();
  });
});

describe('isValidLanguage', () => {
  it('accepts every supported language', () => {
    SUPPORTED_LANGUAGES.forEach(language => {
      expect(isValidLanguage(language)).toBe(true);
    });
  });

  it('rejects unsupported values', () => {
    expect(isValidLanguage('fr')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
    expect(isValidLanguage(undefined)).toBe(false);
    expect(isValidLanguage(null)).toBe(false);
  });
});
