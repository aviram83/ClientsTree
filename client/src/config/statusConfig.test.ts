import { describe, it, expect } from 'vitest';
import { ClientStatus, STATUS_CONFIG } from './statusConfig';

describe('STATUS_CONFIG', () => {
  it('has a config entry for every ClientStatus value', () => {
    Object.values(ClientStatus).forEach((status) => {
      expect(STATUS_CONFIG[status]).toBeDefined();
    });
  });

  it('every entry has a label and color classes', () => {
    Object.values(STATUS_CONFIG).forEach((entry) => {
      expect(entry.label).toBeTruthy();
      expect(entry.colorClass).toBeTruthy();
      expect(entry.inactiveColorClass).toBeTruthy();
      expect(entry.cssVar).toBeTruthy();
    });
  });
});
