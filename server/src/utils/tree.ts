import prisma from '../db';

// IDOR guard shared by addNode/updateNode/deleteNode: a caller could
// otherwise read/mutate another user's node by guessing/observing its id.
// "Found but wrong owner" is treated the same as "not found" — callers
// should respond 404, not a distinguishable 403 that would confirm the id
// exists to a non-owner.
export const findOwnedNode = (id: string, userId: string) => {
  return prisma.treeNode.findFirst({ where: { id, userId } });
};
