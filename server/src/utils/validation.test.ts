import { describe, it, expect } from 'vitest';
import { ClientStatus } from '@prisma/client';
import { isValidClientStatus, sanitizeDescription } from './validation';

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
