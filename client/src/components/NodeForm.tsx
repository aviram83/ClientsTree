import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TreeNode } from '../api/types';
import { ClientStatus, STATUS_CONFIG } from '../config/statusConfig';
import { PERCENTAGE_LEVEL_CONFIG, PercentageLevel } from '../config/percentageConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MoveNodePicker } from './MoveNodePicker';

interface NodeFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  node?: TreeNode | null;
  isLoading: boolean;
  // Move... is only meaningful in edit mode, so `tree`/`onMove` are optional
  // — DashboardPage passes them for edit, omits them for add.
  tree?: TreeNode[];
  onMove?: (nodeId: string, newParentId: string) => void;
}

export const NodeForm = ({ onSubmit, onClose, node, isLoading, tree, onMove }: NodeFormProps) => {
  const { t } = useTranslation();
  // Swaps the modal's content in place to the tree-aware move picker, rather
  // than stacking a second modal. A node can never have a valid move target
  // that is itself, so the root (parentId === null) never gets a "Move..."
  // button in the first place.
  const [isMoveViewOpen, setIsMoveViewOpen] = useState(false);
  const defaultFormValues = {
    name: node?.name || '',
    status: node?.status || Object.keys(STATUS_CONFIG)[0],
    percentageLevel: node?.percentageLevel || PercentageLevel.LEVEL_6,
    active: node?.active ?? true,
    description: node?.description || '',
  };
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: defaultFormValues,
  });

  const activeValue = watch('active');
  const statusValue = watch('status');
  const isSupervisor = statusValue === ClientStatus.SUPERVISOR;

  // SUPERVISOR nodes are always 50% (LEVEL_4) — lock the field the moment
  // the status is selected, so the UI can never submit a mismatched pair
  // (the server enforces the same rule, but this avoids a round-trip 400).
  useEffect(() => {
    if (isSupervisor) {
      setValue('percentageLevel', PercentageLevel.LEVEL_4);
    }
  }, [isSupervisor, setValue]);

  const handleFormSubmit = handleSubmit((data) => {
    // Disabled <select> fields are excluded from react-hook-form's submitted
    // values, so the locked percentageLevel must be re-applied here rather
    // than relying on the (disabled) field's own value.
    onSubmit(isSupervisor ? { ...data, percentageLevel: PercentageLevel.LEVEL_4 } : data);
  });

  // Root can never have a valid move target (every other node is its own
  // descendant), so the button is only shown for a non-root node in edit mode.
  const canMove = !!node && node.parentId !== null && !!tree && !!onMove;

  const handleOpenMoveView = () => {
    // Discard any unsaved name/description edits silently — the picker view
    // replaces the form entirely, and coming back to it should start fresh
    // from the node's saved values rather than resurface stale edits.
    reset(defaultFormValues);
    setIsMoveViewOpen(true);
  };

  if (isMoveViewOpen && node && tree && onMove) {
    return (
      <MoveNodePicker
        tree={tree}
        node={node}
        isLoading={isLoading}
        onCancel={() => setIsMoveViewOpen(false)}
        onConfirm={(newParentId) => onMove(node.id, newParentId)}
      />
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">{t('nodeForm.nameLabel')}</Label>
        <Input id="name" {...register('name')} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">{t('nodeForm.descriptionLabel')}</Label>
        <Textarea
          id="description"
          {...register('description')}
          maxLength={4000}
          rows={4}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">{t('nodeForm.statusLabel')}</Label>
        <select
          id="status"
          {...register('status')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {Object.entries(STATUS_CONFIG).map(([statusKey, { labelKey }]) => (
            <option key={statusKey} value={statusKey}>{t(labelKey)}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="percentageLevel">{t('nodeForm.discountLabel')}</Label>
        <select
          id="percentageLevel"
          {...register('percentageLevel')}
          disabled={isSupervisor}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Object.entries(PERCENTAGE_LEVEL_CONFIG).map(([levelKey, { labelKey }]) => (
            <option key={levelKey} value={levelKey}>{t(labelKey)}</option>
          ))}
        </select>
        {isSupervisor && (
          <p className="text-end text-xs text-muted-foreground">{t('nodeForm.supervisorLockedNote')}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="active"
          checked={activeValue}
          onCheckedChange={(checked) => setValue('active', checked)}
        />
        <Label htmlFor="active" className="cursor-pointer font-normal">{t('nodeForm.activeLabel')}</Label>
      </div>
      <div className="flex items-center justify-between gap-2">
        {canMove ? (
          <Button type="button" variant="destructive" onClick={handleOpenMoveView}>
            {t('nodeForm.move.button')}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>
    </form>
  );
};
