import i18n from '../i18n';

export const PASSWORD_MIN_LENGTH = 6;

export const passwordsMatchValidator = (value: string, password: string) =>
  value === password || i18n.t('register.passwordsDontMatch');
