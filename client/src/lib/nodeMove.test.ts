import { describe, it, expect } from 'vitest';
import { TreeNode } from '../api/types';
import { ClientStatus } from '../config/statusConfig';
import { PercentageLevel } from '../config/percentageConfig';
import {
  getDescendantIds,
  isValidMoveTarget,
  findNodeById,
  computeParentMoveContext,
  computeHouseReclassificationPreview,
} from './nodeMove';

// Defaults to a house-visible level (LEVEL_1) so existing reclassification
// tests exercise the "normal, already-assigned" case by default; tests for
// the hidden-level (LEVEL_6) exclusion set percentageLevel explicitly.
const node = (overrides: Partial<TreeNode> & { id: string }): TreeNode => ({
  name: overrides.id,
  status: ClientStatus.CLIENT,
  userId: 'user-1',
  parentId: null,
  active: true,
  percentageLevel: PercentageLevel.LEVEL_1,
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

describe('findNodeById', () => {
  it('finds a root-level node', () => {
    const tree = [node({ id: 'a' }), node({ id: 'b' })];
    expect(findNodeById(tree, 'b')).toEqual(expect.objectContaining({ id: 'b' }));
  });

  it('finds a nested descendant node', () => {
    const tree = [node({ id: 'a', children: [node({ id: 'b', children: [node({ id: 'c' })] })] })];
    expect(findNodeById(tree, 'c')).toEqual(expect.objectContaining({ id: 'c' }));
  });

  it('returns null when the id is not present anywhere in the tree', () => {
    const tree = [node({ id: 'a', children: [node({ id: 'b' })] })];
    expect(findNodeById(tree, 'missing')).toBeNull();
  });
});

describe('computeParentMoveContext', () => {
  it('is depth 0 / no supervisor ancestor for a top-level root node', () => {
    const tree = [node({ id: 'root' })];
    expect(computeParentMoveContext(tree, 'root')).toEqual({ hasSupervisorAncestor: false, depth: 0 });
  });

  it('is depth 1 / no supervisor ancestor for a direct child of the root when there is no supervisor above', () => {
    const tree = [node({ id: 'root', children: [node({ id: 'a' })] })];
    expect(computeParentMoveContext(tree, 'a')).toEqual({ hasSupervisorAncestor: false, depth: 1 });
  });

  it('is true/depth-0 for an active supervisor that is itself the root', () => {
    const tree = [node({ id: 'sup', status: ClientStatus.SUPERVISOR, active: true })];
    expect(computeParentMoveContext(tree, 'sup')).toEqual({ hasSupervisorAncestor: true, depth: 0 });
  });

  it('stays false for a child of an inactive supervisor, tracking depth regardless', () => {
    const tree = [
      node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: false,
        children: [node({ id: 'child' })],
      }),
    ];
    expect(computeParentMoveContext(tree, 'child')).toEqual({ hasSupervisorAncestor: false, depth: 1 });
  });

  it('remains true and increments depth for a node further below an active supervisor ancestor', () => {
    const tree = [
      node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: true,
        children: [node({ id: 'mid', children: [node({ id: 'leaf' })] })],
      }),
    ];
    expect(computeParentMoveContext(tree, 'leaf')).toEqual({ hasSupervisorAncestor: true, depth: 2 });
  });

  it('returns null when the id is not found', () => {
    const tree = [node({ id: 'root' })];
    expect(computeParentMoveContext(tree, 'missing')).toBeNull();
  });
});

describe('computeHouseReclassificationPreview', () => {
  it('returns null when nothing changes (same ancestor flag, same depth)', () => {
    const moved = node({ id: 'a' });
    expect(computeHouseReclassificationPreview(moved, false, false, 1, 1)).toBeNull();
    expect(computeHouseReclassificationPreview(moved, true, true, 3, 3)).toBeNull();
  });

  it('reports a plain cross-boundary move (Personal -> Supervisor) for a non-supervisor node', () => {
    const moved = node({ id: 'a' });
    const preview = computeHouseReclassificationPreview(moved, false, true, 1, 1);
    expect(preview).toEqual({ toSupervisorCount: 1, toPersonalCount: 0 });
  });

  it('reports the reverse direction (Supervisor -> Personal) for a non-supervisor node', () => {
    const moved = node({ id: 'a' });
    const preview = computeHouseReclassificationPreview(moved, true, false, 1, 1);
    expect(preview).toEqual({ toSupervisorCount: 0, toPersonalCount: 1 });
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
          percentageLevel: PercentageLevel.LEVEL_4,
          children: [node({ id: 'shielded1' }), node({ id: 'shielded2' })],
        }),
        node({ id: 'unshielded' }),
      ],
    });

    // Moved from depth 1 to depth 1 (e.g. sideways under a different depth-0
    // parent) — no depth change, only the ancestor flag changes.
    const preview = computeHouseReclassificationPreview(moved, false, true, 1, 1);

    // "a" and "unshielded" are affected via the ancestor flag (2). "sup" is a
    // supervisor at depth 1 in both cases (no depth change), so unaffected;
    // shielded1/shielded2 already have an internal supervisor ancestor, so
    // the external ancestry change doesn't touch their membership.
    expect(preview).toEqual({ toSupervisorCount: 2, toPersonalCount: 0 });
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

    const preview = computeHouseReclassificationPreview(moved, false, true, 1, 1);

    // "a" and "notShielded" are both affected (2); "inactiveSup" is inactive
    // so it isn't visible in any house (excluded), and it does not shield its
    // child because it's inactive.
    expect(preview).toEqual({ toSupervisorCount: 2, toPersonalCount: 0 });
  });

  // Regression: a node on the hidden default level (LEVEL_6, unset) never
  // renders in either house per flattenVisibleHouseNodes (houseLayout.ts),
  // regardless of active/ancestry/depth — the preview must not count it as
  // "affected" just because it's active.
  it('excludes a node on the hidden LEVEL_6 percentage level, even if active', () => {
    const moved = node({
      id: 'a',
      children: [
        node({ id: 'hidden', percentageLevel: PercentageLevel.LEVEL_6 }),
        node({ id: 'visible' }),
      ],
    });

    const preview = computeHouseReclassificationPreview(moved, false, true, 1, 1);

    // Only "a" and "visible" are affected (2); "hidden" is on LEVEL_6 and
    // never shows in a house, so reclassifying it changes nothing visible.
    expect(preview).toEqual({ toSupervisorCount: 2, toPersonalCount: 0 });
  });

  describe('SUPERVISOR depth-1 boundary crossing (Fix 2)', () => {
    it('a depth-1 supervisor moved deeper loses clients-house membership (toSupervisor), even with no ancestor-flag change', () => {
      const movedSupervisor = node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: true,
        percentageLevel: PercentageLevel.LEVEL_4,
      });

      // Ancestor flag unchanged (false -> false): the new parent isn't itself
      // a supervisor. Depth changes from 1 (direct root child) to 3.
      const preview = computeHouseReclassificationPreview(movedSupervisor, false, false, 1, 3);
      expect(preview).toEqual({ toSupervisorCount: 1, toPersonalCount: 0 });
    });

    it('a nested (depth 2) supervisor moved up to become a direct root child (depth 1) gains clients-house membership (toPersonal)', () => {
      const movedSupervisor = node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: true,
        percentageLevel: PercentageLevel.LEVEL_4,
      });

      const preview = computeHouseReclassificationPreview(movedSupervisor, false, false, 2, 1);
      expect(preview).toEqual({ toSupervisorCount: 0, toPersonalCount: 1 });
    });

    it('moving a supervisor whose depth does not cross the boundary (e.g. depth 2 -> depth 4) is not affected by the depth rule', () => {
      const movedSupervisor = node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: true,
        percentageLevel: PercentageLevel.LEVEL_4,
      });

      expect(computeHouseReclassificationPreview(movedSupervisor, false, false, 2, 4)).toBeNull();
    });

    it('does not count a SUPERVISOR on the hidden LEVEL_6 percentage level as affected even when its depth crosses the depth-1 boundary', () => {
      const movedHiddenSupervisor = node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: true,
        percentageLevel: PercentageLevel.LEVEL_6,
      });

      // Same depth crossing (1 -> 3) as the "loses membership" case above,
      // but isVisibleInAHouse requires a showsInHouse percentageLevel —
      // LEVEL_6 never shows, so this must stay null regardless of depth.
      expect(computeHouseReclassificationPreview(movedHiddenSupervisor, false, false, 1, 3)).toBeNull();
    });

    it('ignores an ancestor-flag change for the moved SUPERVISOR itself when its own depth does not cross the boundary', () => {
      const movedSupervisor = node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: true,
        percentageLevel: PercentageLevel.LEVEL_4,
      });

      // Ancestor flag changes (false -> true, e.g. the new parent is itself
      // under a different supervisor), but depth stays 2 -> 2. A SUPERVISOR's
      // own clients-house membership is depth-only, so the ancestor-flag
      // change must not leak into this branch.
      expect(computeHouseReclassificationPreview(movedSupervisor, false, true, 2, 2)).toBeNull();
    });

    it('an inactive supervisor crossing the depth-1 boundary is never counted as affected (active gate wins over depth)', () => {
      const movedInactiveSupervisor = node({
        id: 'sup',
        status: ClientStatus.SUPERVISOR,
        active: false,
        percentageLevel: PercentageLevel.LEVEL_4,
      });

      // Depth crosses 1 -> 3 (same as the active-supervisor "loses" case
      // above), but the node is inactive, so it's never visible in a house
      // regardless of depth — isVisibleInAHouse requires active.
      expect(computeHouseReclassificationPreview(movedInactiveSupervisor, false, false, 1, 3)).toBeNull();
    });

    it('propagates the depth delta through a supervisor-under-supervisor chain moved together', () => {
      // moved (depth 1, SUPERVISOR) -> nested (depth 2, SUPERVISOR) -> leaf (depth 3, CLIENT)
      // Moving the whole chain from depth 1 down to depth 3 (delta +2):
      //  - moved: old depth 1 (member) -> new depth 3 (not member) => toSupervisor
      //  - nested: old depth 2 -> new depth 4, never crosses depth 1 => unaffected by depth rule
      //  - nested's own ancestor flag is already true (shielded internally by "moved"), so it was
      //    never a clients-house member via ancestry either way — but as a SUPERVISOR its
      //    clients-house membership is depth-based, not ancestry-based, and it doesn't cross depth 1.
      //  - leaf: a CLIENT, already shielded by "moved" (an active supervisor) both before and after
      //    the move (internalAncestorHasSupervisor stays true throughout), so it's unaffected.
      const moved = node({
        id: 'moved',
        status: ClientStatus.SUPERVISOR,
        active: true,
        percentageLevel: PercentageLevel.LEVEL_4,
        children: [
          node({
            id: 'nested',
            status: ClientStatus.SUPERVISOR,
            active: true,
            percentageLevel: PercentageLevel.LEVEL_4,
            children: [node({ id: 'leaf' })],
          }),
        ],
      });

      // Ancestor flag for "moved" itself is unchanged (false -> false, its new
      // parent is a plain client too); only depth changes, 1 -> 3.
      const preview = computeHouseReclassificationPreview(moved, false, false, 1, 3);
      expect(preview).toEqual({ toSupervisorCount: 1, toPersonalCount: 0 });
    });

    it('reports both directions at once when a constant depth delta crosses the boundary two ways within the same subtree', () => {
      // moved (SUPERVISOR, old depth 1) -> child (SUPERVISOR, old depth 2)
      // Moving the pair up by one level (delta -1):
      //  - moved: old depth 1 (member) -> new depth 0 (not member) => toSupervisor
      //  - child: old depth 2 (not member) -> new depth 1 (member) => toPersonal
      const moved = node({
        id: 'moved',
        status: ClientStatus.SUPERVISOR,
        active: true,
        percentageLevel: PercentageLevel.LEVEL_4,
        children: [
          node({
            id: 'child',
            status: ClientStatus.SUPERVISOR,
            active: true,
            percentageLevel: PercentageLevel.LEVEL_4,
          }),
        ],
      });

      const preview = computeHouseReclassificationPreview(moved, false, false, 1, 0);
      expect(preview).toEqual({ toSupervisorCount: 1, toPersonalCount: 1 });
    });
  });
});
