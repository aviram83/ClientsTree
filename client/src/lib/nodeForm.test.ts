import { describe, it, expect } from 'vitest';
import { shouldApplySupervisorLevelDefault } from './nodeForm';
import { ClientStatus } from '../config/statusConfig';

describe('shouldApplySupervisorLevelDefault', () => {
  it('applies when the user changes the status to SUPERVISOR', () => {
    expect(shouldApplySupervisorLevelDefault(ClientStatus.CLIENT, ClientStatus.SUPERVISOR)).toBe(true);
    expect(shouldApplySupervisorLevelDefault(ClientStatus.CLIENT_VIP, ClientStatus.SUPERVISOR)).toBe(true);
    expect(shouldApplySupervisorLevelDefault(ClientStatus.DISTRIBUTOR, ClientStatus.SUPERVISOR)).toBe(true);
  });

  it('regression: does NOT apply on the initial render of an existing SUPERVISOR node', () => {
    // Opening the edit form for a node that is already a SUPERVISOR seeds the
    // ref with SUPERVISOR, so there is no transition — the node's stored level
    // (including an unset/null one) must survive untouched instead of being
    // silently overwritten with 50% just by looking at the form.
    expect(shouldApplySupervisorLevelDefault(ClientStatus.SUPERVISOR, ClientStatus.SUPERVISOR)).toBe(false);
  });

  it('does not apply when leaving SUPERVISOR or when SUPERVISOR is never involved', () => {
    expect(shouldApplySupervisorLevelDefault(ClientStatus.SUPERVISOR, ClientStatus.CLIENT)).toBe(false);
    expect(shouldApplySupervisorLevelDefault(ClientStatus.CLIENT, ClientStatus.CLIENT)).toBe(false);
    expect(shouldApplySupervisorLevelDefault(ClientStatus.CLIENT, ClientStatus.DISTRIBUTOR)).toBe(false);
  });

  it('re-applies when the user switches away from SUPERVISOR and back', () => {
    // The default is a convenience for picking the status, so picking it again
    // after moving away should offer it again.
    expect(shouldApplySupervisorLevelDefault(ClientStatus.CLIENT, ClientStatus.SUPERVISOR)).toBe(true);
  });

  it('handles an undefined status on either side without applying spuriously', () => {
    expect(shouldApplySupervisorLevelDefault(undefined, ClientStatus.SUPERVISOR)).toBe(true);
    expect(shouldApplySupervisorLevelDefault(ClientStatus.SUPERVISOR, undefined)).toBe(false);
    expect(shouldApplySupervisorLevelDefault(undefined, undefined)).toBe(false);
  });
});
