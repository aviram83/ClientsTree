import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../db';
import { isValidClientStatus, isValidPercentageLevel, isSupervisorLevelValid, sanitizeDescription } from '../utils/validation';
import { findOwnedNode, wouldCreateCycle } from '../utils/tree';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getTree = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const nodes = await prisma.treeNode.findMany({
      where: { userId },
    });

    const nodeMap = new Map<string, any>();
    const tree: any[] = [];

    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    nodes.forEach(node => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId);
        parent.children.push(nodeMap.get(node.id));
      } else {
        tree.push(nodeMap.get(node.id));
      }
    });

    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addNode = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { parentId, name, status, active, description, percentageLevel } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!isValidClientStatus(status)) {
    return res.status(400).json({ message: `Invalid status value provided: ${status}` });
  }

  if (percentageLevel !== undefined && percentageLevel !== null && !isValidPercentageLevel(percentageLevel)) {
    return res.status(400).json({ message: `Invalid percentageLevel value provided: ${percentageLevel}` });
  }

  if (!isSupervisorLevelValid(status, percentageLevel)) {
    return res.status(400).json({ message: 'SUPERVISOR nodes must have percentageLevel LEVEL_4' });
  }

  if (description && description.length > 4000) {
    return res.status(400).json({ message: 'Description too long' });
  }

  const cleanDescription = sanitizeDescription(description);

  try {
    if (parentId) {
      const parent = await findOwnedNode(parentId, userId);
      if (!parent) {
        return res.status(404).json({ message: 'Parent node not found' });
      }
    } else {
      // Only one root per user is a supported shape — getTree, HouseView, and
      // TreeVisualizer all assume a single root. Reject a second one instead
      // of silently creating a shape nothing downstream can render.
      const existingRoot = await prisma.treeNode.findFirst({ where: { userId, parentId: null } });
      if (existingRoot) {
        return res.status(400).json({ message: 'A root node already exists for this user' });
      }
    }

    const newNode = await prisma.treeNode.create({
      data: {
        name,
        status,
        userId,
        parentId,
        active,
        description: cleanDescription,
        percentageLevel,
      },
    });
    res.status(201).json(newNode);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateNode = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { name, status, active, description, percentageLevel } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Validate status only if it's provided in the request
  if (status && !isValidClientStatus(status)) {
    return res.status(400).json({ message: `Invalid status value provided: ${status}` });
  }

  if (percentageLevel !== undefined && percentageLevel !== null && !isValidPercentageLevel(percentageLevel)) {
    return res.status(400).json({ message: `Invalid percentageLevel value provided: ${percentageLevel}` });
  }

  if (description && description.length > 4000) {
    return res.status(400).json({ message: 'Description too long' });
  }

  const cleanDescription = description ? sanitizeDescription(description) : undefined;

  try {
    // Ownership must be confirmed on every update, not just when
    // status/percentageLevel are being changed — a plain rename must not be
    // reachable for a node belonging to another user.
    const existing = await findOwnedNode(id, userId);
    if (!existing) {
      return res.status(404).json({ message: 'Node not found' });
    }

    // Known race: two concurrent updates to the same node can each read a stale
    // row here and individually pass validation, combining into an invalid
    // final state (e.g. SUPERVISOR at a non-LEVEL_4 percentage). Accepted risk
    // for this single-user app — not worth a transaction for a double-click.
    if (status !== undefined || percentageLevel !== undefined) {
      const effectiveStatus = status ?? existing.status;
      const effectivePercentageLevel = percentageLevel !== undefined ? percentageLevel : existing.percentageLevel;

      if (!isSupervisorLevelValid(effectiveStatus, effectivePercentageLevel)) {
        return res.status(400).json({ message: 'SUPERVISOR nodes must have percentageLevel LEVEL_4' });
      }
    }

    const updatedNode = await prisma.treeNode.update({
      where: { id },
      data: {
        name,
        status,
        active,
        description: cleanDescription,
        percentageLevel,
      },
    });
    res.json(updatedNode);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteNode = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const node = await findOwnedNode(id, userId);

    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    if (node.parentId === null) {
      return res.status(400).json({ message: 'Cannot delete the root node.' });
    }

    await prisma.treeNode.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const moveNode = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { newParentId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!newParentId || typeof newParentId !== 'string') {
    return res.status(400).json({ message: 'newParentId is required' });
  }

  try {
    const node = await findOwnedNode(id, userId);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    const targetParent = await findOwnedNode(newParentId, userId);
    if (!targetParent) {
      console.warn('Rejected move: target parent not found or not owned', { userId, nodeId: id, newParentId });
      return res.status(404).json({ message: 'Target parent not found' });
    }

    if (newParentId === id) {
      console.warn('Rejected move: self-move', { userId, nodeId: id, newParentId });
      return res.status(400).json({ message: 'Cannot move a node under itself' });
    }

    // Cycle check needs the shape of the whole tree (parentId chain), not
    // just the two endpoints — load the user's nodes to walk it in-memory
    // rather than round-tripping to the DB once per ancestor level.
    const allNodes = await prisma.treeNode.findMany({
      where: { userId },
      select: { id: true, parentId: true },
    });

    if (wouldCreateCycle(id, newParentId, allNodes)) {
      console.warn('Rejected move: would create a cycle', { userId, nodeId: id, newParentId });
      return res.status(400).json({ message: 'Cannot move a node under one of its own descendants' });
    }

    const updatedNode = await prisma.treeNode.update({
      where: { id },
      data: { parentId: newParentId },
    });

    console.log('Node moved', { userId, nodeId: id, fromParentId: node.parentId, toParentId: newParentId });
    res.json(updatedNode);
  } catch (error) {
    // P2025: the node (or, less commonly, the target parent) was deleted by
    // a concurrent request between our lookups above and this update.
    // P2003: the target parent's row was deleted mid-flight, violating the
    // parentId foreign key. Both are a benign "someone else changed the tree
    // first" race, not a server fault — surface them as 404 instead of 500.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2025' || error.code === 'P2003')
    ) {
      return res.status(404).json({ message: 'This node or its target no longer exists — refresh and try again.' });
    }
    res.status(500).json({ message: 'Server error', error });
  }
};
