import prisma from '../db';

// IDOR guard shared by addNode/updateNode/deleteNode: a caller could
// otherwise read/mutate another user's node by guessing/observing its id.
// "Found but wrong owner" is treated the same as "not found" — callers
// should respond 404, not a distinguishable 403 that would confirm the id
// exists to a non-owner.
export const findOwnedNode = (id: string, userId: string) => {
  return prisma.treeNode.findFirst({ where: { id, userId } });
};

export interface NodeParentRef {
  id: string;
  parentId: string | null;
}

// Cycle guard for the move endpoint: moving `nodeId` under `newParentId`
// would create a cycle if newParentId is nodeId itself, or if newParentId is
// one of nodeId's own descendants. Walking parentId links upward from
// newParentId will reach nodeId in exactly that second case, since nodeId is
// then an ancestor of newParentId. `nodes` is expected to be the full set of
// the requesting user's nodes (already scoped by caller), so this never
// crosses into another user's tree.
export const wouldCreateCycle = (
  nodeId: string,
  newParentId: string,
  nodes: NodeParentRef[]
): boolean => {
  if (nodeId === newParentId) {
    return true;
  }

  const parentById = new Map(nodes.map((node) => [node.id, node.parentId]));
  const seen = new Set<string>();
  let current: string | null | undefined = newParentId;

  while (current) {
    if (current === nodeId) {
      return true;
    }
    if (seen.has(current)) {
      // Defensive: shouldn't happen with well-formed data, but avoids an
      // infinite loop if a pre-existing cycle ever slipped into the data.
      break;
    }
    seen.add(current);
    current = parentById.get(current);
  }

  return false;
};
