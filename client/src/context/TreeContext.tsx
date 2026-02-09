import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { TreeNode } from '../api/types';
import * as api from '../api';
import { useAuth } from './AuthContext';

interface TreeContextType {
  tree: TreeNode[];
  fetchTree: () => Promise<void>;
  addNode: (data: any) => Promise<void>;
  updateNode: (id: string, data: any) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  isLoading: boolean;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export const TreeProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const effectRan = useRef(false);

  const fetchTree = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await api.fetchTree();
      setTree(response.data);
    } catch (error) {
      console.error('Failed to fetch tree', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (effectRan.current === false) {
      fetchTree();

      return () => {
        effectRan.current = true;
      };
    }
  }, [fetchTree]);

  const addNode = async (data: any) => {
    setIsLoading(true);
    try {
      await api.addNode(data);
      await fetchTree(); // Refetch the whole tree to get updates
    } catch(e) {
        console.error(e)
    }
    finally {
      setIsLoading(false);
    }
  };

  const updateNode = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      await api.updateNode(id, data);
      await fetchTree(); // Refetch to see changes
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNode = async (id: string) => {
    setIsLoading(true);
    try {
      await api.deleteNode(id);
      await fetchTree(); // Refetch to update the tree
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TreeContext.Provider value={{ tree, fetchTree, addNode, updateNode, deleteNode, isLoading }}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTree = () => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
};
