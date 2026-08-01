import { memo } from 'react';

export interface HouseNodeData extends Record<string, unknown> {
  label: string;
  status: string;
  active: boolean;
  size: number;
}

// Below this size the label text would be unreadable clutter — show the
// shape only and rely on the title tooltip for the name.
const MIN_SIZE_FOR_LABEL = 30;

// Read-only counterpart to CustomNode: unlike the tree view, every client
// in the house renders as the same black-bordered square regardless of
// status — no drag handles, no edit/delete affordances, no React Flow
// Handles, since clients in the house aren't connected by tree edges.
const HouseNode = memo(({ data }: { data: HouseNodeData }) => {
  const [firstName, ...rest] = data.label.split(' ');
  const lastName = rest.join(' ');

  return (
    <div
      className="flex items-center justify-center text-center p-1 border-[3px] border-black rounded-none bg-white text-foreground"
      style={{ width: data.size, height: data.size }}
      title={data.label}
    >
      {data.size >= MIN_SIZE_FOR_LABEL && (
        <div className="text-[10px] font-bold leading-tight">
          <div>{firstName}</div>
          {lastName && <div>{lastName}</div>}
        </div>
      )}
    </div>
  );
});

export default HouseNode;
