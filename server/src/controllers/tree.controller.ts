import { Request, Response } from 'express';
import prisma from '../db';
import { isValidClientStatus, sanitizeDescription } from '../utils/validation';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getTree = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

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
  const { parentId, name, status, active, description } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!isValidClientStatus(status)) {
    return res.status(400).json({ message: `Invalid status value provided: ${status}` });
  }

  if (description && description.length > 4000) {
    return res.status(400).json({ message: 'Description too long' });
  }

  const cleanDescription = sanitizeDescription(description);

  try {
    const newNode = await prisma.treeNode.create({
      data: {
        name,
        status,
        userId,
        parentId,
        active,
        description: cleanDescription,
      },
    });
    res.status(201).json(newNode);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateNode = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status, active, description } = req.body;

  // Validate status only if it's provided in the request
  if (status && !isValidClientStatus(status)) {
    return res.status(400).json({ message: `Invalid status value provided: ${status}` });
  }

  if (description && description.length > 4000) {
    return res.status(400).json({ message: 'Description too long' });
  }

  const cleanDescription = description ? sanitizeDescription(description) : undefined;

  try {
    const updatedNode = await prisma.treeNode.update({
      where: { id },
      data: {
        name,
        status,
        active,
        description: cleanDescription,
      },
    });
    res.json(updatedNode);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteNode = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const node = await prisma.treeNode.findUnique({
      where: { id },
    });

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
