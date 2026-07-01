import { useForm } from 'react-hook-form';
import { TreeNode } from '../api/types';
import { STATUS_CONFIG } from '../config/statusConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface NodeFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  node?: TreeNode | null;
  isLoading: boolean;
}

export const NodeForm = ({ onSubmit, onClose, node, isLoading }: NodeFormProps) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: node?.name || '',
      status: node?.status || Object.keys(STATUS_CONFIG)[0],
      active: node?.active ?? true,
      description: node?.description || '',
    },
  });

  const activeValue = watch('active');

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          maxLength={4000}
          rows={4}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          {...register('status')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {Object.entries(STATUS_CONFIG).map(([statusKey, { label }]) => (
            <option key={statusKey} value={statusKey}>{label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="active"
          checked={activeValue}
          onCheckedChange={(checked) => setValue('active', checked)}
        />
        <Label htmlFor="active" className="cursor-pointer font-normal">Active</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
