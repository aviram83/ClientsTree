// Derives the HTML `dir` attribute from the app's language. Kept as a pure
// function (no DOM access) so it's unit-testable in isolation; the DOM write
// happens in applyProfileLanguage, the single sync point for language changes.
export type Direction = 'rtl' | 'ltr';

export const languageToDir = (language: string | undefined): Direction => {
  switch (language) {
    case 'en':
      return 'ltr';
    case 'he':
      return 'rtl';
    default:
      // Unknown/undefined language falls back to 'rtl', matching the DB
      // default and the app's default language ('he').
      return 'rtl';
  }
};
