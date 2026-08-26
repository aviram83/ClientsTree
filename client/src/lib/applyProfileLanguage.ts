import type { i18n as I18n } from 'i18next';
import { languageToDir } from './dirUtils';

// Applies the saved profile language to i18next, falling back to the app
// default ('he') when there's no profile (e.g. logged out) — so a previous
// user's language choice doesn't leak into the login screen on a shared device.
// Also syncs `<html dir>` from the same language, so RTL/LTR layout direction
// and translated strings never drift out of sync — this is the single place
// both are derived from.
export const applyProfileLanguage = (i18n: Pick<I18n, 'changeLanguage'>, language: string | undefined) => {
  i18n.changeLanguage(language ?? 'he');
  if (typeof document !== 'undefined') {
    document.documentElement.dir = languageToDir(language ?? 'he');
  }
};
