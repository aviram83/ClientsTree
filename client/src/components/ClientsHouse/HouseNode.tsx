import { memo } from 'react';

export interface HouseNodeData extends Record<string, unknown> {
  label: string;
  size: number;
}

// Below this size the label text would be unreadable clutter — show the
// shape only and rely on the title tooltip for the name.
const MIN_SIZE_FOR_LABEL = 30;

// Font size scales with the node's own size (rather than a fixed px value)
// so that at least ~10 characters per row fit inside the box without being
// ellipsized. React Flow's zoom scales the whole canvas via CSS transform,
// so this ratio holds at every zoom level — zooming in enlarges the box and
// its text together, revealing the full name instead of "...".
const MAX_FONT_SIZE = 10;
const FONT_SIZE_RATIO = 0.14;

// Read-only counterpart to CustomNode: unlike the tree view, every client
// in the house renders as the same black-bordered square regardless of
// status — no drag handles, no edit/delete affordances, no React Flow
// Handles, since clients in the house aren't connected by tree edges.
const HouseNode = memo(({ data }: { data: HouseNodeData }) => {
  const [firstName, ...rest] = data.label.trim().split(/\s+/);
  const lastName = rest.join(' ');
  const fontSize = Math.min(MAX_FONT_SIZE, data.size * FONT_SIZE_RATIO);

  return (
    <div
      className="flex items-center justify-center overflow-hidden text-center p-1 border-[2px] border-black rounded-none bg-card text-foreground"
      style={{ width: data.size, height: data.size }}
      title={data.label}
    >
      {data.size >= MIN_SIZE_FOR_LABEL && (
        <div className="min-w-0 max-w-full font-bold leading-tight" style={{ fontSize }}>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">{firstName}</div>
          {lastName && <div className="overflow-hidden text-ellipsis whitespace-nowrap">{lastName}</div>}
        </div>
      )}
    </div>
  );
});

export default HouseNode;
