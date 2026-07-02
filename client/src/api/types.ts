import { ClientStatus } from '../config/statusConfig';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
}

export interface TreeNode {
  id: string;
  name: string;
  status: ClientStatus;
  userId: string;
  parentId: string | null;
  active: boolean;
  description?: string;
  createdAt: string;
  children: TreeNode[];
}
