import { useState, useCallback } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTree, TreeProvider } from '../context/TreeContext';
import { useProfileStore } from '../store/profileStore';
import TreeVisualizer from '../components/TreeVisualizer';
import { Modal } from '../components/Modal';
import { NodeForm } from '../components/NodeForm';
import { TreeNode } from '../api/types';
import StatusLegend from '../components/StatusLegend';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { UserSideMenu } from '../components/UserSideMenu';

const DashboardContent = () => {
  const { logout } = useAuth();
  const { profile } = useProfileStore();
  const { tree, isLoading, addNode, updateNode, deleteNode } = useTree();
  
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

  const handleOpenEditModal = useCallback((nodeId: string) => {
    const nodeToEdit = findNodeInTree(tree, nodeId);
    if(nodeToEdit) {
      setModalAction('edit');
      setCurrentNode(nodeToEdit);
      setIsModalOpen(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

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

  const handleDeleteNode = async (nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      await deleteNode(nodeId);
    }
  };


  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-md z-30">
        <header className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setIsSideMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 ml-10"
            aria-label="Open user menu"
          >
            <Avatar>
              <AvatarFallback>
                {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold">{profile?.firstName}</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-xl">
              Active Clients: <span className="font-bold">{countActiveNodes(tree) - 1}</span>
            </div>
          </div>
        </header>
      </div>
      <main className="flex-grow relative z-10">
        <StatusLegend />
        {isLoading && <p className="p-4">Loading tree...</p>}
        {!isLoading && tree.length === 0 && <p className="p-4">No nodes in your tree yet.</p>}
        {!isLoading && tree.length > 0 && (
            <div className="h-full">
                <TreeVisualizer 
                    treeData={tree}
                    onAddNode={handleOpenAddModal}
                    onEditNode={handleOpenEditModal}
                    onDeleteNode={handleDeleteNode}
                />
            </div>
        )}
      </main>
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalAction === 'add' ? 'Add New Client' : 'Edit Client'}
        textColor="text-black"
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

export const DashboardPage = () => (
  <TreeProvider>
    <DashboardContent />
  </TreeProvider>
);