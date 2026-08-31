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

// Walks the tree from its roots down to `parentId`, returning the
// "hasSupervisorAncestor" flag that would apply to a hypothetical child of
// that node — i.e. true if parentId itself is an active SUPERVISOR, or if any
// of its own ancestors is. Mirrors houseLayout.ts's flattenVisibleHouseNodes
// walk (a one-way switch: once true for an ancestor, every descendant below
// inherits true regardless of what's above that ancestor). Returns null if
// parentId isn't found in the tree.
export const computeHasSupervisorAncestorAtParent = (tree: TreeNode[], parentId: string): boolean | null => {
  let result: boolean | null = null;

  const visit = (node: TreeNode, hasSupervisorAncestor: boolean) => {
    const selfFlag = hasSupervisorAncestor || (node.status === ClientStatus.SUPERVISOR && node.active);
    if (node.id === parentId) {
      result = selfFlag;
      return;
    }
    node.children?.forEach((child) => visit(child, selfFlag));
  };

  tree.forEach((node) => visit(node, false));
  return result;
};

export type HouseReclassificationDirection = 'toSupervisor' | 'toPersonal';

export interface HouseReclassificationPreview {
  count: number;
  direction: HouseReclassificationDirection;
}

// Counts how many nodes in the moved subtree (including the moved node
// itself) would flip Personal-House <-> Supervisor-House membership if the
// subtree's "incoming" hasSupervisorAncestor flag changed from false to true
// (or vice versa) at the top. A node is excluded from the count when:
//  - it isn't actually visible in either house — flattenVisibleHouseNodes
//    requires active AND a percentageLevel whose showsInHouse is true, so an
//    inactive node OR one still on the hidden default (LEVEL_6, unset) never
//    renders in a house regardless of ancestry, and reclassifying it is
//    meaningless;
//  - it's a SUPERVISOR node (its own membership is ancestry-independent —
//    status alone decides it — active or not);
//  - it's already shielded by an active SUPERVISOR *inside* the subtree —
//    once such a supervisor is passed, everything below it keeps its
//    membership regardless of what's above the subtree.
// Supervisor nodes (active or not) still shield everything below them once
// active, and are walked into regardless of their own active/inactive state
// so their descendants are still evaluated.
const countAffectedInSubtree = (node: TreeNode, internalAncestorHasSupervisor: boolean): number => {
  const isSupervisorStatus = node.status === ClientStatus.SUPERVISOR;
  const isActiveSupervisor = isSupervisorStatus && node.active;
  const isVisibleInAHouse = Boolean(
    node.active && node.percentageLevel && PERCENTAGE_LEVEL_CONFIG[node.percentageLevel]?.showsInHouse
  );
  const isAffected = isVisibleInAHouse && !isSupervisorStatus && !internalAncestorHasSupervisor;
  let count = isAffected ? 1 : 0;

  const childFlag = internalAncestorHasSupervisor || isActiveSupervisor;
  node.children?.forEach((child) => {
    count += countAffectedInSubtree(child, childFlag);
  });

  return count;
};

// Builds the move preview's house-reclassification line, or null when the
// move doesn't change anyone's house. Two cases produce null on purpose:
//  - the moved node is itself an active SUPERVISOR: its own membership never
//    depends on ancestry, and it already unconditionally shields every
//    descendant below it, so moving it changes nothing for the subtree.
//  - the "incoming" hasSupervisorAncestor flag is unchanged by the move
//    (same value at the old parent and the new one).
export const computeHouseReclassificationPreview = (
  movedNode: TreeNode,
  originalHasSupervisorAncestor: boolean,
  newHasSupervisorAncestor: boolean
): HouseReclassificationPreview | null => {
  const isActiveSupervisor = movedNode.status === ClientStatus.SUPERVISOR && movedNode.active;
  if (isActiveSupervisor) return null;
  if (originalHasSupervisorAncestor === newHasSupervisorAncestor) return null;

  const count = countAffectedInSubtree(movedNode, false);
  if (count === 0) return null;

  return {
    count,
    direction: newHasSupervisorAncestor ? 'toSupervisor' : 'toPersonal',
  };
};
