import { describe, it, expect } from 'vitest';
import { PASSWORD_MIN_LENGTH, passwordsMatchValidator } from './passwordValidation';
import he from '../i18n/locales/he.json';

describe('passwordsMatchValidator', () => {
  it('returns true when the confirmation matches the password', () => {
    expect(passwordsMatchValidator('secret123', 'secret123')).toBe(true);
  });

  it('returns an error message when the confirmation does not match the password', () => {
    // Asserted against literal locale content, not i18n.t() with the same key
    // the implementation uses, so a deleted/renamed key fails this test.
    expect(passwordsMatchValidator('different', 'secret123')).toBe(he.register.passwordsDontMatch);
  });
});

describe('PASSWORD_MIN_LENGTH', () => {
  it('is 6, matching the server-side minimum', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(6);
  });
});
