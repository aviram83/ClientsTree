export const PASSWORD_MIN_LENGTH = 6;

export const passwordsMatchValidator = (value: string, password: string) =>
  value === password || "Passwords don't match";
