import type { i18n as I18n } from 'i18next';

// Applies the saved profile language to i18next, falling back to the app
// default ('he') when there's no profile (e.g. logged out) — so a previous
// user's language choice doesn't leak into the login screen on a shared device.
export const applyProfileLanguage = (i18n: Pick<I18n, 'changeLanguage'>, language: string | undefined) => {
  i18n.changeLanguage(language ?? 'he');
};
