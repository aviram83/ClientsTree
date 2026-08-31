import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TreeNode } from '../api/types';
import { Button } from '@/components/ui/button';
import {
  getDescendantIds,
  isValidMoveTarget,
  findNodeById,
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

// Depth is shown two ways: indentation guide lines (like a file-tree view) and
// the row's own start-padding growing with depth, so nesting is legible even
// when guide lines are subtle at a glance.
const PickerRow = ({ candidate, depth, nodeId, descendantIds, selectedParentId, onSelect }: PickerRowProps) => {
  const isDisabled = !isValidMoveTarget(nodeId, candidate.id, descendantIds);
  const isSelected = selectedParentId === candidate.id;

  return (
    <>
      <div className="flex items-stretch">
        {Array.from({ length: depth }).map((_, i) => (
          <div key={i} className="w-4 shrink-0 border-e-2 border-input" aria-hidden="true" />
        ))}
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => onSelect(candidate.id)}
          className={`min-h-11 flex-1 min-w-0 py-2.5 ps-2 pe-3 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isDisabled
              ? 'cursor-not-allowed text-muted-foreground/50'
              : isSelected
                ? 'bg-primary/10 font-medium text-foreground'
                : 'text-foreground hover:bg-muted'
          }`}
        >
          {candidate.name}
        </button>
      </div>
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
  // Starts with nothing selected — defaulting to the current parent made the
  // confirm button look ready-to-go for a selection that's actually a no-op.
  // The current parent still stays selectable in the list (per the hardening
  // decision: it's a harmless target, not an invalid/greyed one) — it's just
  // not pre-picked, and picking it explicitly doesn't enable the button.
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  // "Move here" doesn't move immediately — it swaps the bottom box's text and
  // buttons to an explicit yes/no step, reusing the same box rather than
  // inserting a new one, so the modal's height stays put.
  const [isConfirmingMove, setIsConfirmingMove] = useState(false);

  const descendantIds = useMemo(() => getDescendantIds(node), [node]);
  const descendantCount = descendantIds.size;

  const isNoOpSelection = selectedParentId !== null && selectedParentId === node.parentId;

  const selectedTarget = useMemo(
    () => (selectedParentId ? findNodeById(tree, selectedParentId) : null),
    [tree, selectedParentId]
  );

  const reclassificationPreview = useMemo(() => {
    if (!selectedParentId || !node.parentId) return null;
    const originalHasSupervisorAncestor = computeHasSupervisorAncestorAtParent(tree, node.parentId) ?? false;
    const newHasSupervisorAncestor = computeHasSupervisorAncestorAtParent(tree, selectedParentId) ?? false;
    return computeHouseReclassificationPreview(node, originalHasSupervisorAncestor, newHasSupervisorAncestor);
  }, [tree, node, selectedParentId]);

  const handleSelect = (id: string) => {
    setSelectedParentId(id);
    // Changing the target after opening the confirm step re-opens the
    // picker, so the confirm text never goes stale against a new selection.
    setIsConfirmingMove(false);
  };

  const handleMoveClick = () => {
    if (selectedParentId) {
      setIsConfirmingMove(true);
    }
  };

  const handleConfirmYes = () => {
    if (selectedParentId) {
      onConfirm(selectedParentId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary block: a fixed 3 lines (heading / target-or-current-parent /
          descendant count) so the card never grows or shrinks as the
          selection changes. The 2nd line is a single slot (not two stacked
          ones), so there's no dead gap when only one of its two possible
          messages applies. The reclassification line is the one exception:
          it's genuinely new information for a cross-boundary move, so it's
          appended as a real 4th line only when it applies, rather than
          reserved as blank space the rest of the time. */}
      <div className="space-y-1 rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
        <p className="text-base text-foreground">
          {t('nodeForm.move.headingPrefix')} <strong className="font-semibold">{node.name}</strong>
        </p>
        <p className={`text-base text-foreground ${selectedParentId ? '' : 'invisible'}`}>
          {isNoOpSelection ? (
            <span className="text-sm text-muted-foreground">{t('nodeForm.move.currentParentNote')}</span>
          ) : (
            <>
              {t('nodeForm.move.targetPrefix')} <strong className="font-semibold">{selectedTarget?.name ?? ' '}</strong>
            </>
          )}
        </p>
        <p className="text-sm text-muted-foreground">{t('nodeForm.move.descendantCount', { count: descendantCount })}</p>
        {reclassificationPreview && (
          <p className="text-sm text-muted-foreground">
            {t(
              reclassificationPreview.direction === 'toSupervisor'
                ? 'nodeForm.move.toSupervisorHouse'
                : 'nodeForm.move.toPersonalHouse',
              { count: reclassificationPreview.count }
            )}
          </p>
        )}
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border border-input">
        {tree.map((rootNode) => (
          <PickerRow
            key={rootNode.id}
            candidate={rootNode}
            depth={0}
            nodeId={node.id}
            descendantIds={descendantIds}
            selectedParentId={selectedParentId}
            onSelect={handleSelect}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{t('nodeForm.move.instructions')}</p>
      {/* Action box: holds the warning/confirm text next to its buttons in
          one row (stacked on narrow screens) so the confirm step reads as a
          single, more prominent unit instead of a plain line above the
          buttons. Always present (not conditionally mounted), so swapping
          between picking and confirming doesn't change the modal's height. */}
      <div
        className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
          isConfirmingMove ? 'border-destructive/40 bg-destructive/10' : 'border-input bg-muted/40'
        }`}
      >
        <p className={`text-sm ${isConfirmingMove ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
          {isConfirmingMove && selectedTarget
            ? t('nodeForm.move.confirmPrompt', { name: node.name, target: selectedTarget.name })
            : ' '}
        </p>
        <div className="flex shrink-0 justify-end gap-2">
          {isConfirmingMove && selectedTarget ? (
            <>
              <Button type="button" variant="outline" onClick={() => setIsConfirmingMove(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirmYes} disabled={isLoading}>
                {isLoading ? t('common.saving') : t('nodeForm.move.confirmYes')}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleMoveClick}
                disabled={!selectedParentId || isNoOpSelection || isLoading}
              >
                {t('nodeForm.move.confirm')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
