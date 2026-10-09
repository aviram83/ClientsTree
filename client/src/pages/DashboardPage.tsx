import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTreeStore } from '../store/treeStore';
import { useTreeUIStore } from '../store/treeUIStore';
import TreeVisualizer from '../components/TreeVisualizer';
import { Modal } from '../components/Modal';
import { NodeForm } from '../components/NodeForm';
import { countActiveMyClients, isDirectChildOfRoot } from '../lib/treeUtils';
import { AppLayout } from './AppLayout';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const tree = useTreeStore((s) => s.tree);
  const isLoading = useTreeStore((s) => s.isLoading);
  const addNode = useTreeStore((s) => s.addNode);
  const updateNode = useTreeStore((s) => s.updateNode);
  const moveNode = useTreeStore((s) => s.moveNode);
  const fetchTree = useTreeStore((s) => s.fetchTree);
  const isModalOpen = useTreeUIStore((s) => s.isModalOpen);
  const modalAction = useTreeUIStore((s) => s.modalAction);
  const currentNode = useTreeUIStore((s) => s.currentNode);
  const closeModal = useTreeUIStore((s) => s.closeModal);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      fetchTree();
      return () => {
        effectRan.current = true;
      };
    }
  }, [fetchTree]);

  const activeMyClientCount = useMemo(() => countActiveMyClients(tree), [tree]);

  const handleSaveNode = async (data: any) => {
    if (modalAction === 'add' && currentNode) {
      await addNode({ ...data, parentId: currentNode.parentId });
    } else if (modalAction === 'edit' && currentNode) {
      await updateNode(currentNode.id, data);
    }
    closeModal();
  };

  const handleMoveNode = async (nodeId: string, newParentId: string) => {
    await moveNode(nodeId, newParentId);
    closeModal();
  };

  return (
    <AppLayout>
      {tree.length === 0 && isLoading && <p className="p-4">{t('dashboard.loadingTree')}</p>}
      {tree.length === 0 && !isLoading && <p className="p-4">{t('dashboard.noNodes')}</p>}
      {tree.length > 0 && (
          <div className="h-full">
              <TreeVisualizer
                  treeData={tree}
                  activeCount={activeMyClientCount}
              />
          </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalAction === 'add' ? t('dashboard.addClientTitle') : t('dashboard.editClientTitle')}
        textColor="text-foreground"
      >
        <NodeForm
          onSubmit={handleSaveNode}
          onClose={closeModal}
          node={currentNode}
          isLoading={isLoading}
          tree={modalAction === 'edit' ? tree : undefined}
          onMove={modalAction === 'edit' ? handleMoveNode : undefined}
          defaultMyClient={
            modalAction === 'add' && currentNode
              ? isDirectChildOfRoot(tree, currentNode.parentId)
              : undefined
          }
        />
      </Modal>
    </AppLayout>
  );
};
