import { memo } from 'react';
import { getShapeStyles } from '../CustomNode';
import { STATUS_CONFIG, ClientStatus } from '../../config/statusConfig';

export interface HouseNodeData extends Record<string, unknown> {
  label: string;
  status: string;
  active: boolean;
  size: number;
}

// Below this size the label text would be unreadable clutter — show the
// shape/color only and rely on the title tooltip for the name.
const MIN_SIZE_FOR_LABEL = 30;

// Read-only counterpart to CustomNode: same shape/color logic, no drag
// handles, no edit/delete affordances, no React Flow Handles — clients
// in the house aren't connected by tree edges.
const HouseNode = memo(({ data }: { data: HouseNodeData }) => {
  const statusInfo = STATUS_CONFIG[data.status as ClientStatus];
  const shapeClass = getShapeStyles(data.status);
  const colorClass = data.active ? statusInfo?.colorClass : 'bg-status-inactive';

  return (
    <div
      className={`flex items-center justify-center text-center p-1 border-2 text-foreground filter drop-shadow-md ${colorClass} ${shapeClass}`}
      style={{ width: data.size, height: data.size }}
      title={data.label}
    >
      {data.size >= MIN_SIZE_FOR_LABEL && (
        <div className="text-[10px] font-bold leading-tight whitespace-nowrap">
          {data.label}
        </div>
      )}
    </div>
  );
});

export default HouseNode;
