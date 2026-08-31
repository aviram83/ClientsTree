import { describe, it, expect } from 'vitest';
import { TreeNode } from '../api/types';
import { ClientStatus } from '../config/statusConfig';
import {
  getDescendantIds,
  isValidMoveTarget,
  computeHasSupervisorAncestorAtParent,
  computeHouseReclassificationPreview,
} from './nodeMove';

const node = (overrides: Partial<TreeNode> & { id: string }): TreeNode => ({
  name: overrides.id,
  status: ClientStatus.CLIENT,
  userId: 'user-1',
  parentId: null,
  active: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  children: [],
  ...overrides,
});

describe('getDescendantIds', () => {
  it('collects every descendant id, not including the node itself', () => {
    const tree = node({
      id: 'a',
      children: [
        node({ id: 'b', children: [node({ id: 'c' })] }),
        node({ id: 'd' }),
      ],
    });

    expect(getDescendantIds(tree)).toEqual(new Set(['b', 'c', 'd']));
  });

  it('returns an empty set for a leaf node', () => {
    expect(getDescendantIds(node({ id: 'leaf' }))).toEqual(new Set());
  });
});

describe('isValidMoveTarget', () => {
  const descendantIds = new Set(['b', 'c']);

  it('rejects the node itself', () => {
    expect(isValidMoveTarget('a', 'a', descendantIds)).toBe(false);
  });

  it('rejects a descendant', () => {
    expect(isValidMoveTarget('a', 'b', descendantIds)).toBe(false);
  });

  it('allows an unrelated node', () => {
    expect(isValidMoveTarget('a', 'z', descendantIds)).toBe(true);
  });

  it('allows the current parent (idempotent no-op move)', () => {
    expect(isValidMoveTarget('a', 'root', descendantIds)).toBe(true);
  });
});

describe('computeHasSupervisorAncestorAtParent', () => {
  it('is false directly under the root when there is no supervisor above', () => {
    const tree = [node({ id: 'root', children: [node({ id: 'a' })] })];
    expect(computeHasSupervisorAncestorAtParent(tree, 'a')).toBe(false);
  });

  it('is true for a child of an active supervisor', () => {
    const tree = [node({ id: 'sup', status: ClientStatus.SUPERVISOR, active: true })];
    expect(computeHasSupervisorAncestorAtParent(tree, 'sup')).toBe(true);
  });

  it('stays false for a child of an inactive supervisor', () => {
    const tree = [node({ id: 'sup', status: ClientStatus.SUPERVISOR, active: false })];
    expect(computeHasSupervisorAncestorAtParent(tree, 'sup')).toBe(false);
  });

  it('remains true for a node further below an active supervisor ancestor', () => {
    const tree = [
      node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: true,
        children: [node({ id: 'mid', children: [node({ id: 'leaf' })] })],
      }),
    ];
    expect(computeHasSupervisorAncestorAtParent(tree, 'leaf')).toBe(true);
  });

  it('returns null when the id is not found', () => {
    const tree = [node({ id: 'root' })];
    expect(computeHasSupervisorAncestorAtParent(tree, 'missing')).toBeNull();
  });
});

describe('computeHouseReclassificationPreview', () => {
  it('returns null when moving an active SUPERVISOR node itself', () => {
    const movedSupervisor = node({ id: 'sup', status: ClientStatus.SUPERVISOR, active: true });
    expect(computeHouseReclassificationPreview(movedSupervisor, false, true)).toBeNull();
  });

  it('returns null when the ancestry flag is unchanged by the move', () => {
    const moved = node({ id: 'a' });
    expect(computeHouseReclassificationPreview(moved, false, false)).toBeNull();
    expect(computeHouseReclassificationPreview(moved, true, true)).toBeNull();
  });

  it('reports a plain cross-boundary move (Personal -> Supervisor)', () => {
    const moved = node({ id: 'a' });
    const preview = computeHouseReclassificationPreview(moved, false, true);
    expect(preview).toEqual({ count: 1, direction: 'toSupervisor' });
  });

  it('reports the reverse direction (Supervisor -> Personal)', () => {
    const moved = node({ id: 'a' });
    const preview = computeHouseReclassificationPreview(moved, true, false);
    expect(preview).toEqual({ count: 1, direction: 'toPersonal' });
  });

  it('excludes descendants already shielded by an internal active supervisor', () => {
    // moved (a) -> sup (active SUPERVISOR) -> shielded1, shielded2
    //           -> unshielded
    const moved = node({
      id: 'a',
      children: [
        node({
          id: 'sup',
          status: ClientStatus.SUPERVISOR,
          active: true,
          children: [node({ id: 'shielded1' }), node({ id: 'shielded2' })],
        }),
        node({ id: 'unshielded' }),
      ],
    });

    const preview = computeHouseReclassificationPreview(moved, false, true);

    // Only "a" and "unshielded" are affected (2). "sup" is a supervisor, and
    // shielded1/shielded2 already have an internal supervisor ancestor, so
    // the external ancestry change doesn't touch their membership.
    expect(preview).toEqual({ count: 2, direction: 'toSupervisor' });
  });

  it('excludes descendants shielded by an inactive-turned-active check correctly (no shielding from an inactive supervisor)', () => {
    const moved = node({
      id: 'a',
      children: [
        node({
          id: 'inactiveSup',
          status: ClientStatus.SUPERVISOR,
          active: false,
          children: [node({ id: 'notShielded' })],
        }),
      ],
    });

    const preview = computeHouseReclassificationPreview(moved, false, true);

    // "a" and "notShielded" are both affected (2); "inactiveSup" is a
    // supervisor node and never counted itself, and it does not shield its
    // child because it's inactive.
    expect(preview).toEqual({ count: 2, direction: 'toSupervisor' });
  });
});
