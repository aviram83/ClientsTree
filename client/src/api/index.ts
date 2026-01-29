import api from './axios';
import { User, TreeNode } from './types';
import { ClientStatus } from '../config/statusConfig';

// Auth
export const register = (data: any) => api.post('/auth/register', data);
export const login = (data: any) => api.post<{ token: string; user: User }>('/auth/login', data);

// Tree
export const fetchTree = () => api.get<TreeNode[]>('/tree');
export const addNode = (data: { parentId: string; name: string; status: ClientStatus, description?: string }) => api.post<TreeNode>('/tree', data);
export const updateNode = (id: string, data: { name?: string; status?: ClientStatus, description?: string }) => api.put<TreeNode>(`/tree/${id}`, data);
export const deleteNode = (id: string) => api.delete(`/tree/${id}`);
