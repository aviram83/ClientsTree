import { ClientStatus, PercentageLevel } from '@prisma/client';
import xss from 'xss';

export const isValidClientStatus = (status: any): status is ClientStatus => {
  return Object.values(ClientStatus).includes(status);
};

export const isValidPercentageLevel = (level: any): level is PercentageLevel => {
  return Object.values(PercentageLevel).includes(level);
};

// SUPERVISOR nodes are always 50% (LEVEL_4) — not independently editable.
export const isSupervisorLevelValid = (
  status: ClientStatus,
  percentageLevel: PercentageLevel | null | undefined
): boolean => {
  return status !== ClientStatus.SUPERVISOR || percentageLevel === PercentageLevel.LEVEL_4;
};

export const sanitizeDescription = (description: string | null | undefined): string | null => {
  return description ? xss(description) : null;
};

export const SUPPORTED_LANGUAGES = ['he', 'en'] as const;

export const isValidLanguage = (value: unknown): value is (typeof SUPPORTED_LANGUAGES)[number] => {
  return SUPPORTED_LANGUAGES.includes(value as (typeof SUPPORTED_LANGUAGES)[number]);
};
