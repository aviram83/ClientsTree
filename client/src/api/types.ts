import { ClientStatus } from '../config/statusConfig';
import { PercentageLevel } from '../config/percentageConfig';

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
  percentageLevel?: PercentageLevel;
  userId: string;
  parentId: string | null;
  active: boolean;
  description?: string;
  createdAt: string;
  children: TreeNode[];
}
