import { TreeNode } from '../api/types';

export const findNodeInTree = (nodes: TreeNode[], nodeId: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children) {
      const found = findNodeInTree(node.children, nodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};
