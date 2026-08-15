import { describe, it, expect } from 'vitest';
import { ClientStatus, PercentageLevel } from '@prisma/client';
import { isValidClientStatus, isValidPercentageLevel, isSupervisorLevelValid, sanitizeDescription } from './validation';

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

describe('isSupervisorLevelValid', () => {
  it('accepts SUPERVISOR with LEVEL_4', () => {
    expect(isSupervisorLevelValid(ClientStatus.SUPERVISOR, PercentageLevel.LEVEL_4)).toBe(true);
  });

  it('rejects SUPERVISOR with any other level', () => {
    expect(isSupervisorLevelValid(ClientStatus.SUPERVISOR, PercentageLevel.LEVEL_2)).toBe(false);
    expect(isSupervisorLevelValid(ClientStatus.SUPERVISOR, PercentageLevel.LEVEL_6)).toBe(false);
  });

  it('rejects SUPERVISOR with a null/undefined level', () => {
    expect(isSupervisorLevelValid(ClientStatus.SUPERVISOR, null)).toBe(false);
    expect(isSupervisorLevelValid(ClientStatus.SUPERVISOR, undefined)).toBe(false);
  });

  it('accepts any level for non-SUPERVISOR statuses', () => {
    expect(isSupervisorLevelValid(ClientStatus.CLIENT, PercentageLevel.LEVEL_1)).toBe(true);
    expect(isSupervisorLevelValid(ClientStatus.CLIENT_VIP, null)).toBe(true);
    expect(isSupervisorLevelValid(ClientStatus.DISTRIBUTOR, undefined)).toBe(true);
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
