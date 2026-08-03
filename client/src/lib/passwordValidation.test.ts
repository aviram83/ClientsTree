import { describe, it, expect } from 'vitest';
import { PASSWORD_MIN_LENGTH, passwordsMatchValidator } from './passwordValidation';

describe('passwordsMatchValidator', () => {
  it('returns true when the confirmation matches the password', () => {
    expect(passwordsMatchValidator('secret123', 'secret123')).toBe(true);
  });

  it('returns an error message when the confirmation does not match the password', () => {
    expect(passwordsMatchValidator('different', 'secret123')).toBe("Passwords don't match");
  });
});

describe('PASSWORD_MIN_LENGTH', () => {
  it('is 6, matching the server-side minimum', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(6);
  });
});
