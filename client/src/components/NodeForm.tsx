import { useForm } from 'react-hook-form';
import { TreeNode } from '../api/types';
import { STATUS_CONFIG } from '../config/statusConfig';

interface NodeFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  node?: TreeNode | null;
  isLoading: boolean;
}

export const NodeForm = ({ onSubmit, onClose, node, isLoading }: NodeFormProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: node?.name || '',
      status: node?.status || Object.keys(STATUS_CONFIG)[0],
      active: node?.active ?? true,
      description: node?.description || '',
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" {...register('name')} required className="input input-bordered w-full" />
      </div>
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea
          id="description"
          {...register('description')}
          maxLength={4000}
          className="textarea textarea-bordered w-full"
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="status" className="label">Status</label>
        <select id="status" {...register('status')} className="select select-bordered w-full">
          {Object.entries(STATUS_CONFIG).map(([statusKey, { label }]) => (
            <option key={statusKey} value={statusKey}>{label}</option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Active</span> 
          <input type="checkbox" {...register('active')} className="toggle toggle-primary" />
        </label>
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="btn">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
