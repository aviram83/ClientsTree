import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TreeNode } from '../api/types';
import { Button } from '@/components/ui/button';
import {
  getDescendantIds,
  isValidMoveTarget,
  computeHasSupervisorAncestorAtParent,
  computeHouseReclassificationPreview,
} from '../lib/nodeMove';

interface MoveNodePickerProps {
  tree: TreeNode[];
  node: TreeNode;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: (newParentId: string) => void;
}

interface PickerRowProps {
  candidate: TreeNode;
  depth: number;
  nodeId: string;
  descendantIds: Set<string>;
  selectedParentId: string | null;
  onSelect: (id: string) => void;
}

const PickerRow = ({ candidate, depth, nodeId, descendantIds, selectedParentId, onSelect }: PickerRowProps) => {
  const isDisabled = !isValidMoveTarget(nodeId, candidate.id, descendantIds);
  const isSelected = selectedParentId === candidate.id;

  return (
    <>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => onSelect(candidate.id)}
        style={{ paddingInlineStart: `${depth * 1.25 + 0.75}rem` }}
        className={`flex w-full items-center rounded-md py-1.5 pe-3 text-start text-sm transition-colors ${
          isDisabled
            ? 'cursor-not-allowed text-muted-foreground/50'
            : isSelected
              ? 'bg-primary/10 font-medium text-foreground'
              : 'text-foreground hover:bg-muted'
        }`}
      >
        {candidate.name}
      </button>
      {candidate.children?.map((child) => (
        <PickerRow
          key={child.id}
          candidate={child}
          depth={depth + 1}
          nodeId={nodeId}
          descendantIds={descendantIds}
          selectedParentId={selectedParentId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};

export const MoveNodePicker = ({ tree, node, isLoading, onCancel, onConfirm }: MoveNodePickerProps) => {
  const { t } = useTranslation();
  // Defaults to the current parent — a harmless, idempotent no-op selection
  // (per the hardening decision, the current parent stays selectable rather
  // than greyed out).
  const [selectedParentId, setSelectedParentId] = useState<string | null>(node.parentId);

  const descendantIds = useMemo(() => getDescendantIds(node), [node]);
  const descendantCount = descendantIds.size;

  const reclassificationPreview = useMemo(() => {
    if (!selectedParentId || !node.parentId) return null;
    const originalHasSupervisorAncestor = computeHasSupervisorAncestorAtParent(tree, node.parentId) ?? false;
    const newHasSupervisorAncestor = computeHasSupervisorAncestorAtParent(tree, selectedParentId) ?? false;
    return computeHouseReclassificationPreview(node, originalHasSupervisorAncestor, newHasSupervisorAncestor);
  }, [tree, node, selectedParentId]);

  const handleConfirm = () => {
    if (selectedParentId) {
      onConfirm(selectedParentId);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('nodeForm.move.instructions')}</p>
      <div className="max-h-64 overflow-y-auto rounded-md border border-input">
        {tree.map((rootNode) => (
          <PickerRow
            key={rootNode.id}
            candidate={rootNode}
            depth={0}
            nodeId={node.id}
            descendantIds={descendantIds}
            selectedParentId={selectedParentId}
            onSelect={setSelectedParentId}
          />
        ))}
      </div>
      <div className="space-y-1 rounded-md bg-muted p-3 text-sm text-foreground">
        <p>{t('nodeForm.move.descendantCount', { count: descendantCount })}</p>
        {reclassificationPreview && (
          <p>
            {t(
              reclassificationPreview.direction === 'toSupervisor'
                ? 'nodeForm.move.toSupervisorHouse'
                : 'nodeForm.move.toPersonalHouse',
              { count: reclassificationPreview.count }
            )}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={!selectedParentId || isLoading}>
          {isLoading ? t('common.saving') : t('nodeForm.move.confirm')}
        </Button>
      </div>
    </div>
  );
};
