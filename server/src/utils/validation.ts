import { ClientStatus, PercentageLevel } from '@prisma/client';
import xss from 'xss';

export const isValidClientStatus = (status: any): status is ClientStatus => {
  return Object.values(ClientStatus).includes(status);
};

export const isValidPercentageLevel = (level: any): level is PercentageLevel => {
  return Object.values(PercentageLevel).includes(level);
};

export const sanitizeDescription = (description: string | null | undefined): string | null => {
  return description ? xss(description) : null;
};
