import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTree, TreeProvider } from '../context/TreeContext';
import TreeVisualizer from '../components/TreeVisualizer';
import { Modal } from '../components/Modal';
import { NodeForm } from '../components/NodeForm';
import { TreeNode } from '../api/types';
import StatusLegend from '../components/StatusLegend';

const DashboardContent = () => {
  const { user, logout } = useAuth();
  const { tree, isLoading, addNode, updateNode, deleteNode } = useTree();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'add' | 'edit' | null>(null);
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);

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
    <div className="h-screen w-screen bg-gray-100">
      <div className="relative bg-white shadow-md z-20 overflow-hidden">
        <header className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold ml-10">Welcome, {user?.firstName}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-xl">
              Active Clients: <span className="font-bold">{countActiveNodes(tree)}</span>
            </div>
          </div>
          <button onClick={logout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Logout</button>
        </header>
        <div className="absolute top-[17px] left-[-20px] z-30">
          <div className="transform -rotate-45 bg-red-600 text-center text-white font-semibold py-1 w-[170px]">
            BETA
          </div>
        </div>
      </div>
      <main className="h-full w-full relative z-10">
        <StatusLegend />
        {isLoading && <p className="p-4">Loading tree...</p>}
        {!isLoading && tree.length === 0 && <p className="p-4">No nodes in your tree yet.</p>}
        {!isLoading && tree.length > 0 && (
            <div className="pt-20">
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
        title={modalAction === 'add' ? 'Add New Node' : 'Edit Node'}
      >
        <NodeForm 
          onSubmit={handleSaveNode} 
          onClose={handleCloseModal} 
          node={currentNode}
          isLoading={isLoading} 
        />
      </Modal>
    </div>
  );
};

export const DashboardPage = () => (
  <TreeProvider>
    <DashboardContent />
  </TreeProvider>
);