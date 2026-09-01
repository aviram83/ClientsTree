import { TreeNode } from '../api/types';
import { ClientStatus } from '../config/statusConfig';
import { PercentageLevel, PERCENTAGE_LEVEL_CONFIG, ROOM_LEVELS } from '../config/percentageConfig';

// Matches the tree view's node size (client/src/lib/treeLayout.ts NODE_WIDTH/HEIGHT)
// so a client looks the same size in both views when there's room for it.
export const MAX_HOUSE_NODE_SIZE = 120;

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Roof = full price (LEVEL_0), 2x2 room grid below = the four discount levels.
export const HOUSE_WIDTH = 640;
export const ROOF_HEIGHT = 260;
export const ROOM_WIDTH = 320;
export const ROOM_HEIGHT = 220;
export const HOUSE_HEIGHT = ROOF_HEIGHT + ROOM_HEIGHT * 2;

// Room bounds — only the 4 discount-level rooms use a fixed rectangle. The
// roof is a triangle and needs its own trapezoid-aware layout (below), since a
// fixed rectangle is either too small (wasted roof space) or overflows the
// sloped sides depending on row count.
export const HOUSE_SLOT_BOUNDS: Record<(typeof ROOM_LEVELS)[number], Bounds> = {
  [PercentageLevel.LEVEL_1]: { x: 0, y: ROOF_HEIGHT, width: ROOM_WIDTH, height: ROOM_HEIGHT },
  [PercentageLevel.LEVEL_2]: { x: ROOM_WIDTH, y: ROOF_HEIGHT, width: ROOM_WIDTH, height: ROOM_HEIGHT },
  [PercentageLevel.LEVEL_3]: { x: 0, y: ROOF_HEIGHT + ROOM_HEIGHT, width: ROOM_WIDTH, height: ROOM_HEIGHT },
  [PercentageLevel.LEVEL_4]: { x: ROOM_WIDTH, y: ROOF_HEIGHT + ROOM_HEIGHT, width: ROOM_WIDTH, height: ROOM_HEIGHT },
};

// Roof icon-packing area, expressed as a y-range plus a width margin applied
// to the triangle's true width at each row's vertical center — this keeps
// rows clear of the sloped edges while still using most of the available
// space (unlike a fixed inscribed rectangle, which wastes the wider lower
// part of the triangle).
export const ROOF_LABEL_Y = 60;
export const ROOF_ICON_TOP_Y = 95;
export const ROOF_ICON_BOTTOM_Y = ROOF_HEIGHT - 20;
const ROOF_WIDTH_MARGIN = 0.85;

const roofWidthAtY = (y: number): number => (HOUSE_WIDTH * (y / ROOF_HEIGHT)) * ROOF_WIDTH_MARGIN;

export type HouseMembershipFilter = (node: TreeNode, hasSupervisorAncestor: boolean, depth: number) => boolean;

// Flattens the tree and drops clients whose level is hidden (LEVEL_6) or
// unset, and clients marked inactive — the house only shows current clients.
// An optional membership filter further restricts which visible nodes are
// included; it receives whether a SUPERVISOR sits anywhere above the node
// (tracked in a single pass down the recursion, not a separate tree walk) and
// the node's depth (root-level nodes = depth 0, their direct children =
// depth 1, etc.) — needed by isClientsHouseMember's depth-1 supervisor rule.
export const flattenVisibleHouseNodes = (
  treeData: TreeNode[],
  filter?: HouseMembershipFilter
): TreeNode[] => {
  const result: TreeNode[] = [];

  const visit = (node: TreeNode, hasSupervisorAncestor: boolean, depth: number) => {
    const level = node.percentageLevel;
    const isVisible = Boolean(node.active && level && PERCENTAGE_LEVEL_CONFIG[level]?.showsInHouse);
    if (isVisible && (!filter || filter(node, hasSupervisorAncestor, depth))) {
      result.push(node);
    }

    // An inactive supervisor doesn't count as an ancestor — its descendants
    // are treated as if they have no supervisor above them. (Reparenting an
    // inactive supervisor's children one level up is a separate future task.)
    const descendantHasSupervisorAncestor =
      hasSupervisorAncestor || (node.status === ClientStatus.SUPERVISOR && node.active);
    node.children?.forEach((child) => visit(child, descendantHasSupervisorAncestor, depth + 1));
  };

  treeData.forEach((node) => visit(node, false, 0));
  return result;
};

// Original house: a SUPERVISOR only belongs here if it's a direct child of
// the tree's single root (depth === 1, root itself is depth 0) — plus every
// non-supervisor client with no SUPERVISOR ancestor. A supervisor nested
// deeper (under another supervisor, or under a plain client) shows only in
// the supervisor house, never here.
export const isClientsHouseMember: HouseMembershipFilter = (node, hasSupervisorAncestor, depth) =>
  node.status === ClientStatus.SUPERVISOR ? depth === 1 : !hasSupervisorAncestor;

// Supervisor house: every SUPERVISOR node (any depth — they anchor their
// group's 50% room, same as in the clients house) + every non-supervisor
// client that has a SUPERVISOR ancestor.
export const isSupervisorHouseMember: HouseMembershipFilter = (node, hasSupervisorAncestor) =>
  node.status === ClientStatus.SUPERVISOR || hasSupervisorAncestor;

export const groupNodesByPercentageLevel = (
  nodes: TreeNode[]
): Partial<Record<PercentageLevel, TreeNode[]>> => {
  return nodes.reduce<Partial<Record<PercentageLevel, TreeNode[]>>>((acc, node) => {
    const level = node.percentageLevel;
    if (!level) return acc;
    if (!acc[level]) acc[level] = [];
    acc[level]!.push(node);
    return acc;
  }, {});
};

export interface AdaptiveGridLayout {
  positions: { x: number; y: number }[];
  nodeSize: number;
}

// Grid-packs `count` nodes inside a slot's rectangle, shrinking the node size
// as needed so a crowded room's icons stay inside its bounds instead of
// overflowing — fitting inside the room always wins over a minimum icon size.
// Tries every column count from 1 to `count` and keeps whichever produces the
// largest node size that still fits both width and height.
export const computeAdaptiveGridLayout = (
  count: number,
  bounds: Bounds,
  labelHeight = 32
): AdaptiveGridLayout => {
  if (count <= 0) return { positions: [], nodeSize: MAX_HOUSE_NODE_SIZE };

  const padding = 12;
  const gap = 6;
  const availableWidth = bounds.width - padding * 2;
  const availableHeight = bounds.height - labelHeight - padding * 2;

  let bestSize = 0;
  let bestCols = 1;

  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const sizeFromWidth = (availableWidth - gap * (cols - 1)) / cols;
    const sizeFromHeight = (availableHeight - gap * (rows - 1)) / rows;
    const size = Math.min(sizeFromWidth, sizeFromHeight, MAX_HOUSE_NODE_SIZE);

    if (size > bestSize) {
      bestSize = size;
      bestCols = cols;
    }
  }

  const nodeSize = Math.max(Math.min(bestSize, MAX_HOUSE_NODE_SIZE), 1);

  const positions = Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / bestCols);
    const col = i % bestCols;
    return {
      x: bounds.x + padding + col * (nodeSize + gap),
      y: bounds.y + labelHeight + padding + row * (nodeSize + gap),
    };
  });

  return { positions, nodeSize };
};

// Trapezoid-aware packing for the roof (full-price) triangle: unlike a room's
// fixed rectangle, the roof's usable width grows row by row as you move away
// from the apex. Searches node sizes from MAX_HOUSE_NODE_SIZE downward and,
// for each candidate size, greedily fills rows (as many as fit per row at that
// row's actual triangle width) until every node is placed or the icon area's
// bottom is reached. The first (largest) size where everything fits wins, so
// icons are as large as possible without ever crossing the sloped sides.
export const computeRoofGridLayout = (
  count: number,
  maxSize: number = MAX_HOUSE_NODE_SIZE
): AdaptiveGridLayout => {
  if (count <= 0) return { positions: [], nodeSize: maxSize };

  const gap = 6;

  for (let size = maxSize; size >= 8; size -= 2) {
    const rows: { y: number; cols: number }[] = [];
    let y = ROOF_ICON_TOP_Y;
    let remaining = count;
    let fits = true;

    while (remaining > 0) {
      if (y + size > ROOF_ICON_BOTTOM_Y) {
        fits = false;
        break;
      }
      const rowCenterY = y + size / 2;
      const available = roofWidthAtY(rowCenterY);
      const cols = Math.max(1, Math.floor((available + gap) / (size + gap)));
      const placed = Math.min(cols, remaining);
      rows.push({ y, cols: placed });
      remaining -= placed;
      y += size + gap;
    }

    if (fits && remaining === 0) {
      const positions = rows.flatMap((row) => {
        const rowWidth = row.cols * size + (row.cols - 1) * gap;
        const startX = HOUSE_WIDTH / 2 - rowWidth / 2;
        return Array.from({ length: row.cols }, (_, col) => ({
          x: startX + col * (size + gap),
          y: row.y,
        }));
      });
      return { positions, nodeSize: size };
    }
  }

  // Extreme fallback (shouldn't happen at realistic client counts): stack at
  // the smallest tried size in a single column, best-effort.
  const fallbackSize = 8;
  const positions = Array.from({ length: count }, (_, i) => ({
    x: HOUSE_WIDTH / 2 - fallbackSize / 2,
    y: ROOF_ICON_TOP_Y + i * (fallbackSize + gap),
  }));
  return { positions, nodeSize: fallbackSize };
};
