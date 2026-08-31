import api from './api';
import { User, TreeNode, LanguageCode } from './types';
import { ClientStatus } from '../config/statusConfig';

// Auth
export const register = (data: any) => api.post('/auth/register', data);
export const login = (data: any) => api.post<{ token: string; user: User }>('/auth/login', data);
export const getProfile = () => api.get<User>('/auth/me');
export const updateProfile = (language: LanguageCode) => api.patch<User>('/auth/me', { language });
export const forgotPassword = (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email });
export const resetPassword = (token: string, password: string) =>
  api.post<{ message: string }>('/auth/reset-password', { token, password });

// Tree
export const fetchTree = () => api.get<TreeNode[]>('/tree');
export const addNode = (data: { parentId: string; name: string; status: ClientStatus, description?: string }) => api.post<TreeNode>('/tree', data);
export const updateNode = (id: string, data: { name?: string; status?: ClientStatus, description?: string }) => api.put<TreeNode>(`/tree/${id}`, data);
export const moveNode = (id: string, newParentId: string) => api.patch<TreeNode>(`/tree/${id}/move`, { newParentId });
export const deleteNode = (id: string) => api.delete(`/tree/${id}`);
