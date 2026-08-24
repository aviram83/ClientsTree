import { describe, it, expect, vi } from 'vitest';
import { applyProfileLanguage } from './applyProfileLanguage';

describe('applyProfileLanguage', () => {
  it('falls back to the app default when there is no profile language', () => {
    const changeLanguage = vi.fn();
    applyProfileLanguage({ changeLanguage }, undefined);
    expect(changeLanguage).toHaveBeenCalledWith('he');
  });

  it('applies the saved profile language when present', () => {
    const changeLanguage = vi.fn();
    applyProfileLanguage({ changeLanguage }, 'en');
    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('re-applies when the language changes', () => {
    const changeLanguage = vi.fn();
    applyProfileLanguage({ changeLanguage }, 'en');
    applyProfileLanguage({ changeLanguage }, 'he');
    expect(changeLanguage).toHaveBeenNthCalledWith(1, 'en');
    expect(changeLanguage).toHaveBeenNthCalledWith(2, 'he');
  });
});
