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

// The tree-diagram counter: nodes that are both active AND flagged as the
// user's own client. Roots are the user themselves, so only their
// descendants are counted.
export const countActiveMyClients = (tree: TreeNode[]): number => {
  const countDescendants = (nodes: TreeNode[]): number => {
    let count = 0;
    for (const node of nodes) {
      if (node.active && node.myClient) {
        count++;
      }
      if (node.children) {
        count += countDescendants(node.children);
      }
    }
    return count;
  };

  let total = 0;
  for (const root of tree) {
    total += countDescendants(root.children ?? []);
  }
  return total;
};

// Whether a node with this parentId would be a direct child of the tree's
// single root (the app assumes exactly one root per user).
export const isDirectChildOfRoot = (
  tree: TreeNode[],
  parentId: string | null | undefined,
): boolean => tree.length > 0 && parentId === tree[0].id;
