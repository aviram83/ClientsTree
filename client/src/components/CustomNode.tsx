import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus, Edit, Trash } from 'lucide-react';
import { STATUS_CONFIG, ClientStatus } from '../config/statusConfig';

const getShapeStyles = (status: ClientStatus | string) => {
  switch (status) {
    case ClientStatus.CLIENT:
      return 'rounded-full border-2';
    case ClientStatus.CLIENT_VIP:
      return '[clip-path:polygon(50%_0%,_100%_50%,_50%_100%,_0%_50%)]';
    case ClientStatus.DISTRIBUTOR:
      return '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]';
    case ClientStatus.SUPERVISOR:
      return 'rounded-none border-2';
    default:
      return 'rounded-lg border-2';
  }
};

const areDataPropsEqual = (prevProps: any, nextProps: any) => {
  const prev = prevProps.data;
  const next = nextProps.data;
  return (
    prev.id === next.id &&
    prev.label === next.label &&
    prev.status === next.status &&
    prev.active === next.active &&
    prev.parentId === next.parentId &&
    prev.isDimmed === next.isDimmed &&
    prev.onAdd === next.onAdd &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
  );
};

const CustomNode = memo(({ data }: any) => {
  const isRootNode = data.parentId === null;

  const statusInfo = STATUS_CONFIG[data.status as ClientStatus];
  const statusLabel = statusInfo ? statusInfo.label : 'Unknown';

  let nodeClasses = 'bg-muted rounded-lg border-2';
  let wrapperClasses = 'filter drop-shadow-md';
  let nodeStyle: React.CSSProperties = {};
  let isClipped = false;

  if (statusInfo) {
    const shapeClass = getShapeStyles(data.status);
    isClipped = shapeClass.includes('clip-path');

    if (data.active) {
      nodeClasses = `${statusInfo.colorClass} ${shapeClass}`;
      wrapperClasses = 'filter drop-shadow-md';
      nodeStyle = {};
    } else {
      if (!isClipped) {
        nodeClasses = `bg-status-inactive ${shapeClass.replace('border-2', '')} border-[6px]`;
        nodeStyle = { borderColor: `hsl(var(${statusInfo.cssVar}))` };
        wrapperClasses = 'filter drop-shadow-md';
      }
    }
  }

  if (isRootNode) {
    return (
      <div className={`shadow-md rounded-lg p-4 w-64 bg-card border-4 border-primary text-card-foreground flex items-center justify-center text-center relative group transition-opacity duration-300 ${data.isDimmed ? 'opacity-30' : 'opacity-100'}`}>
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
        <div>
          <div className="text-lg font-bold">{data.label}</div>
        </div>
        <div className="absolute right-[-35px] top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => data.onAdd(data.id)} className="p-1.5 bg-secondary rounded-full hover:bg-secondary/80">
            <Plus size={16} />
          </button>
          <button onClick={() => data.onEdit(data.id)} className="p-1.5 bg-secondary rounded-full hover:bg-secondary/80">
            <Edit size={16} />
          </button>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
      </div>
    );
  }

  if (!data.active && isClipped) {
    const shapeClass = getShapeStyles(data.status);
    return (
      <div className={`relative w-[120px] h-[120px] group transition-opacity duration-300 ${data.isDimmed ? 'opacity-30' : 'opacity-100'}`}>
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 -mt-1" />

        <div
          className={`w-full h-full ${shapeClass}`}
          style={{ backgroundColor: `hsl(var(${statusInfo.cssVar}))` }}
        ></div>

        <div
          className={`
            absolute top-[6px] left-[6px] w-[calc(100%-12px)] h-[calc(100%-12px)]
            ${shapeClass}
            bg-status-inactive
            flex flex-col items-center justify-center text-center p-1
            text-foreground
          `}
        >
          <div className="text-sm font-bold leading-tight">{data.label}</div>
          <div className="text-[10px] uppercase opacity-80 mt-1">{statusLabel}</div>
        </div>

        <div className="absolute -right-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
          <button onClick={() => data.onAdd(data.id)} className="p-1.5 bg-card shadow-sm rounded-full hover:bg-secondary">
            <Plus size={14} />
          </button>
          <button onClick={() => data.onEdit(data.id)} className="p-1.5 bg-card shadow-sm rounded-full hover:bg-secondary">
            <Edit size={14} />
          </button>
          <button onClick={() => data.onDelete(data.id)} className="p-1.5 bg-card shadow-sm rounded-full hover:bg-secondary">
            <Trash size={14} />
          </button>
        </div>

        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 -mb-1" />
      </div>
    );
  }

  return (
    <div className={`relative w-[120px] h-[120px] group transition-opacity duration-300 ${data.isDimmed ? 'opacity-30' : 'opacity-100'} ${wrapperClasses}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 -mt-1" />
      <div
        className={`
          w-full h-full
          flex flex-col items-center justify-center text-center p-1
          ${nodeClasses}
          text-foreground
        `}
        style={nodeStyle}
      >
        <div className="text-sm font-bold leading-tight">{data.label}</div>
        <div className="text-[10px] uppercase opacity-80 mt-1">{statusLabel}</div>
      </div>
      <div className="absolute -right-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <button onClick={() => data.onAdd(data.id)} className="p-1.5 bg-card shadow-sm rounded-full hover:bg-secondary">
          <Plus size={14} />
        </button>
        <button onClick={() => data.onEdit(data.id)} className="p-1.5 bg-card shadow-sm rounded-full hover:bg-secondary">
          <Edit size={14} />
        </button>
        <button onClick={() => data.onDelete(data.id)} className="p-1.5 bg-card shadow-sm rounded-full hover:bg-secondary">
          <Trash size={14} />
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 -mb-1" />
    </div>
  );
}, areDataPropsEqual);

export default CustomNode;
