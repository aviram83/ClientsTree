import { useState } from 'react';
import { TreeNode as TreeNodeType } from '../api/types';
import { useTreeStore } from '../store/treeStore';
import { Plus, Edit, Trash } from 'lucide-react';
import { Modal } from './Modal';
import { NodeForm } from './NodeForm';

interface TreeNodeProps {
  node: TreeNodeType;
}

export const TreeNode = ({ node }: TreeNodeProps) => {
  const addNode = useTreeStore((s) => s.addNode);
  const updateNode = useTreeStore((s) => s.updateNode);
  const deleteNode = useTreeStore((s) => s.deleteNode);
  const isLoading = useTreeStore((s) => s.isLoading);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const handleAddNode = async (data: any) => {
    await addNode({ ...data, parentId: node.id });
    setAddModalOpen(false);
  };

  const handleUpdateNode = async (data: any) => {
    await updateNode(node.id, data);
    setEditModalOpen(false);
  };

  const handleDeleteNode = async () => {
    if (window.confirm('Are you sure you want to delete this node and all its children?')) {
      await deleteNode(node.id);
    }
  };

  return (
    <li className="list-none">
      <div className="flex items-center space-x-2 group my-1">
        <span>{node.name} - <span className="text-muted-foreground text-sm">{node.status}</span></span>
        <div className="hidden group-hover:flex items-center space-x-1">
          <button onClick={() => setAddModalOpen(true)} className="btn btn-xs btn-ghost"><Plus size={16} /></button>
          <button onClick={() => setEditModalOpen(true)} className="btn btn-xs btn-ghost"><Edit size={16} /></button>
          <button onClick={handleDeleteNode} className="btn btn-xs btn-ghost text-destructive"><Trash size={16} /></button>
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <ul className="pl-4 border-l">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add Node">
        <NodeForm
          onSubmit={handleAddNode}
          onClose={() => setAddModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Node">
        <NodeForm
          onSubmit={handleUpdateNode}
          onClose={() => setEditModalOpen(false)}
          node={node}
          isLoading={isLoading}
        />
      </Modal>
    </li>
  );
};
