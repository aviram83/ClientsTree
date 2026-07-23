import { useState, useCallback, useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTreeStore } from '../store/treeStore';
import { useProfileStore } from '../store/profileStore';
import TreeVisualizer from '../components/TreeVisualizer';
import { Modal } from '../components/Modal';
import { NodeForm } from '../components/NodeForm';
import { TreeNode } from '../api/types';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { UserSideMenu } from '../components/UserSideMenu';
import { Logo } from '../components/Logo';

const findNodeInTree = (nodes: TreeNode[], nodeId: string): TreeNode | null => {
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

export const DashboardPage = () => {
  const logout = useAuthStore((s) => s.logout);
  const profile = useProfileStore((s) => s.profile);
  const tree = useTreeStore((s) => s.tree);
  const isLoading = useTreeStore((s) => s.isLoading);
  const addNode = useTreeStore((s) => s.addNode);
  const updateNode = useTreeStore((s) => s.updateNode);
  const fetchTree = useTreeStore((s) => s.fetchTree);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      fetchTree();
      return () => {
        effectRan.current = true;
      };
    }
  }, [fetchTree]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'add' | 'edit' | null>(null);
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const countActiveNodes = (nodes: TreeNode[]): number => {
    let count = 0;
    for (const node of nodes) {
      if (node.active) {
        count++;
      }
      if (node.children) {
        count += countActiveNodes(node.children);
      }
    }
    return count;
  };

  const handleOpenAddModal = useCallback((parentId: string) => {
    setModalAction('add');
    setCurrentNode({ parentId } as TreeNode);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((nodeId: string) => {
    const nodeToEdit = findNodeInTree(useTreeStore.getState().tree, nodeId);
    if(nodeToEdit) {
      setModalAction('edit');
      setCurrentNode(nodeToEdit);
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalAction(null);
    setCurrentNode(null);
  }, []);

  const handleSaveNode = async (data: any) => {
    if (modalAction === 'add' && currentNode) {
      await addNode({ ...data, parentId: currentNode.parentId });
    } else if (modalAction === 'edit' && currentNode) {
      await updateNode(currentNode.id, data);
    }
    handleCloseModal();
  };

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      await useTreeStore.getState().deleteNode(nodeId);
    }
  }, []);


  return (
    <div className="h-screen w-screen bg-muted flex flex-col">
      <div className="bg-card shadow-md z-30">
        <header className="w-full px-4 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
          <button
            type="button"
            onClick={() => setIsSideMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 justify-self-start"
            aria-label="Open user menu"
          >
            <Avatar>
              <AvatarFallback>
                {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold hidden sm:inline">{profile?.firstName}</span>
          </button>
          <Logo className="justify-self-center" />
          <div className="justify-self-end" />
        </header>
      </div>
      <main className="flex-grow relative z-10">
        {tree.length === 0 && isLoading && <p className="p-4">Loading tree...</p>}
        {tree.length === 0 && !isLoading && <p className="p-4">No nodes in your tree yet.</p>}
        {tree.length > 0 && (
            <div className="h-full">
                <TreeVisualizer
                    treeData={tree}
                    onAddNode={handleOpenAddModal}
                    onEditNode={handleOpenEditModal}
                    onDeleteNode={handleDeleteNode}
                    activeCount={countActiveNodes(tree) - 1}
                />
            </div>
        )}
      </main>
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalAction === 'add' ? 'Add New Client' : 'Edit Client'}
        textColor="text-foreground"
      >
        <NodeForm 
          onSubmit={handleSaveNode} 
          onClose={handleCloseModal} 
          node={currentNode}
          isLoading={isLoading} 
        />
      </Modal>
      <UserSideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onLogout={logout}
      />
    </div>
  );
};