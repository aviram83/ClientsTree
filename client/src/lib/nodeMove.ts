import { TreeNode } from '../api/types';
import { ClientStatus } from '../config/statusConfig';
import { PERCENTAGE_LEVEL_CONFIG } from '../config/percentageConfig';

// Collects the ids of every descendant of `node` (not including `node`
// itself). Used both to grey out invalid targets in the move picker (a node
// can't be moved under itself or under one of its own descendants) and, more
// generally, anywhere the client needs cycle awareness without a round trip
// to the server's wouldCreateCycle check.
export const getDescendantIds = (node: TreeNode): Set<string> => {
  const ids = new Set<string>();

  const visit = (current: TreeNode) => {
    current.children?.forEach((child) => {
      ids.add(child.id);
      visit(child);
    });
  };

  visit(node);
  return ids;
};

// Finds a node by id anywhere in the tree (used to resolve the picker's
// currently-selected target back to its display name for the move preview).
export const findNodeById = (tree: TreeNode[], id: string): TreeNode | null => {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = node.children ? findNodeById(node.children, id) : null;
    if (found) return found;
  }
  return null;
};

// A move target is invalid if it's the node itself or one of its descendants
// — moving a node under either would create a cycle, mirroring the server's
// wouldCreateCycle guard. The node's current parent is deliberately NOT
// treated as invalid here (an idempotent no-op move stays selectable).
export const isValidMoveTarget = (nodeId: string, targetId: string, descendantIds: Set<string>): boolean => {
  return targetId !== nodeId && !descendantIds.has(targetId);
};

export interface ParentMoveContext {
  hasSupervisorAncestor: boolean;
  depth: number;
}

// Walks the tree from its roots down to `parentId`, returning the context a
// hypothetical child of that node would have: the "hasSupervisorAncestor"
// flag (true if parentId itself is an active SUPERVISOR, or if any of its own
// ancestors is) and parentId's own depth (root-level nodes = depth 0, so a
// child placed under parentId would sit at `depth + 1`). Mirrors
// houseLayout.ts's flattenVisibleHouseNodes walk (hasSupervisorAncestor is a
// one-way switch: once true for an ancestor, every descendant below inherits
// true regardless of what's above that ancestor; depth increments by exactly
// one per level, matching the tree-root = depth 0 convention used there).
// Returns null if parentId isn't found in the tree.
export const computeParentMoveContext = (tree: TreeNode[], parentId: string): ParentMoveContext | null => {
  let result: ParentMoveContext | null = null;

  const visit = (node: TreeNode, hasSupervisorAncestor: boolean, depth: number) => {
    const selfFlag = hasSupervisorAncestor || (node.status === ClientStatus.SUPERVISOR && node.active);
    if (node.id === parentId) {
      result = { hasSupervisorAncestor: selfFlag, depth };
      return;
    }
    node.children?.forEach((child) => visit(child, selfFlag, depth + 1));
  };

  tree.forEach((node) => visit(node, false, 0));
  return result;
};

export interface HouseReclassificationPreview {
  toSupervisorCount: number;
  toPersonalCount: number;
}

interface SubtreeCounts {
  toSupervisor: number;
  toPersonal: number;
}

const ZERO_COUNTS: SubtreeCounts = { toSupervisor: 0, toPersonal: 0 };

const addCounts = (a: SubtreeCounts, b: SubtreeCounts): SubtreeCounts => ({
  toSupervisor: a.toSupervisor + b.toSupervisor,
  toPersonal: a.toPersonal + b.toPersonal,
});

// Counts how many nodes in the moved subtree (including the moved node
// itself) would flip Personal-House <-> Supervisor-House membership, walking
// every node at its post-move depth (oldDepth + depthDelta, where depthDelta
// is constant across the whole subtree since every node in it shifts by the
// same amount). A node is excluded entirely when it isn't actually visible in
// either house — flattenVisibleHouseNodes requires active AND a
// percentageLevel whose showsInHouse is true, so an inactive node OR one
// still on the hidden default (LEVEL_6, unset) never renders in a house
// regardless of ancestry or depth, and reclassifying it is meaningless.
//
// Two independent rules now decide "affected", mirroring houseLayout.ts's
// isClientsHouseMember/isSupervisorHouseMember pair:
//  - a SUPERVISOR node sits in exactly one house, decided purely by its depth
//    (depth === 1, a direct child of the tree's single root, means clients
//    house; anything else means supervisor house) — it counts as affected if
//    the move crosses that depth-1 boundary in either direction, independent
//    of any ancestor flag;
//  - a non-supervisor node's membership depends only on whether a SUPERVISOR
//    ancestor shields it — it counts as affected if the subtree's incoming
//    ancestor flag changed AND it isn't already shielded by an active
//    SUPERVISOR *inside* the subtree (once such a supervisor is passed,
//    everything below it keeps its membership regardless of what's above the
//    subtree), independent of depth.
// Supervisor nodes (active or not) still shield everything below them once
// active, and are walked into regardless of their own active/inactive state
// so their descendants are still evaluated.
const countAffectedInSubtree = (
  node: TreeNode,
  internalAncestorHasSupervisor: boolean,
  oldDepth: number,
  depthDelta: number,
  ancestorFlagChanged: boolean,
  newHasSupervisorAncestor: boolean
): SubtreeCounts => {
  const isSupervisorStatus = node.status === ClientStatus.SUPERVISOR;
  const isActiveSupervisor = isSupervisorStatus && node.active;
  const isVisibleInAHouse = Boolean(
    node.active && node.percentageLevel && PERCENTAGE_LEVEL_CONFIG[node.percentageLevel]?.showsInHouse
  );

  let counts = ZERO_COUNTS;

  if (isVisibleInAHouse) {
    if (isSupervisorStatus) {
      const newDepth = oldDepth + depthDelta;
      const wasClientsHouseMember = oldDepth === 1;
      const isClientsHouseMemberNow = newDepth === 1;
      if (wasClientsHouseMember && !isClientsHouseMemberNow) {
        counts = { toSupervisor: 1, toPersonal: 0 };
      } else if (!wasClientsHouseMember && isClientsHouseMemberNow) {
        counts = { toSupervisor: 0, toPersonal: 1 };
      }
    } else if (ancestorFlagChanged && !internalAncestorHasSupervisor) {
      counts = newHasSupervisorAncestor ? { toSupervisor: 1, toPersonal: 0 } : { toSupervisor: 0, toPersonal: 1 };
    }
  }

  const childInternalFlag = internalAncestorHasSupervisor || isActiveSupervisor;
  node.children?.forEach((child) => {
    counts = addCounts(
      counts,
      countAffectedInSubtree(child, childInternalFlag, oldDepth + 1, depthDelta, ancestorFlagChanged, newHasSupervisorAncestor)
    );
  });

  return counts;
};

// Builds the move preview's house-reclassification counts, or null when the
// move doesn't change anyone's house. `originalDepth`/`newDepth` are the
// moved node's own depth before and after the move (i.e.
// computeParentMoveContext(...).depth + 1 at the old and new parent
// respectively) — their difference (depthDelta) is applied uniformly to
// every node in the subtree, since a move shifts everyone in it by the same
// amount. Unlike the pre-Fix-2 version, a SUPERVISOR moved node is no longer
// unconditionally skipped: its own clients-house membership can change if the
// move crosses the depth-1 boundary, even when its ancestor flag doesn't
// change (e.g. a supervisor moved from depth 1 to depth 3 under a plain
// client keeps hasSupervisorAncestor === false throughout, but still loses
// its own clients-house membership).
export const computeHouseReclassificationPreview = (
  movedNode: TreeNode,
  originalHasSupervisorAncestor: boolean,
  newHasSupervisorAncestor: boolean,
  originalDepth: number,
  newDepth: number
): HouseReclassificationPreview | null => {
  const ancestorFlagChanged = originalHasSupervisorAncestor !== newHasSupervisorAncestor;
  const depthDelta = newDepth - originalDepth;
  if (!ancestorFlagChanged && depthDelta === 0) return null;

  const counts = countAffectedInSubtree(movedNode, false, originalDepth, depthDelta, ancestorFlagChanged, newHasSupervisorAncestor);
  if (counts.toSupervisor === 0 && counts.toPersonal === 0) return null;

  return { toSupervisorCount: counts.toSupervisor, toPersonalCount: counts.toPersonal };
};
