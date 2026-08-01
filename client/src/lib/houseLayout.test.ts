import { describe, it, expect } from 'vitest';
import {
  flattenVisibleHouseNodes,
  groupNodesByPercentageLevel,
  computeAdaptiveGridLayout,
  computeRoofGridLayout,
  MAX_HOUSE_NODE_SIZE,
  HOUSE_WIDTH,
  ROOF_ICON_TOP_Y,
  ROOF_ICON_BOTTOM_Y,
} from './houseLayout';
import { TreeNode } from '../api/types';
import { ClientStatus } from '../config/statusConfig';
import { PercentageLevel } from '../config/percentageConfig';

const makeNode = (overrides: Partial<TreeNode>): TreeNode => ({
  id: 'id',
  name: 'name',
  status: ClientStatus.CLIENT,
  userId: 'user-1',
  parentId: null,
  active: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  children: [],
  ...overrides,
});

describe('flattenVisibleHouseNodes', () => {
  it('includes nodes with a room/roof-eligible level, at any depth', () => {
    const tree: TreeNode[] = [
      makeNode({
        id: 'root',
        percentageLevel: PercentageLevel.LEVEL_0,
        children: [
          makeNode({ id: 'child-1', parentId: 'root', percentageLevel: PercentageLevel.LEVEL_2 }),
        ],
      }),
    ];

    const result = flattenVisibleHouseNodes(tree);
    expect(result.map((n) => n.id).sort()).toEqual(['child-1', 'root']);
  });

  it('excludes nodes with LEVEL_6 (hidden) or no percentageLevel set', () => {
    const tree: TreeNode[] = [
      makeNode({ id: 'hidden', percentageLevel: PercentageLevel.LEVEL_6 }),
      makeNode({ id: 'unset' }),
      makeNode({ id: 'visible', percentageLevel: PercentageLevel.LEVEL_1 }),
    ];

    const result = flattenVisibleHouseNodes(tree);
    expect(result.map((n) => n.id)).toEqual(['visible']);
  });

  it('excludes inactive clients even when their level is house-eligible', () => {
    const tree: TreeNode[] = [
      makeNode({ id: 'inactive', active: false, percentageLevel: PercentageLevel.LEVEL_1 }),
      makeNode({ id: 'active', active: true, percentageLevel: PercentageLevel.LEVEL_1 }),
    ];

    const result = flattenVisibleHouseNodes(tree);
    expect(result.map((n) => n.id)).toEqual(['active']);
  });
});

describe('groupNodesByPercentageLevel', () => {
  it('groups nodes by their level', () => {
    const nodes: TreeNode[] = [
      makeNode({ id: 'a', percentageLevel: PercentageLevel.LEVEL_1 }),
      makeNode({ id: 'b', percentageLevel: PercentageLevel.LEVEL_1 }),
      makeNode({ id: 'c', percentageLevel: PercentageLevel.LEVEL_4 }),
    ];

    const grouped = groupNodesByPercentageLevel(nodes);
    expect(grouped[PercentageLevel.LEVEL_1]?.map((n) => n.id)).toEqual(['a', 'b']);
    expect(grouped[PercentageLevel.LEVEL_4]?.map((n) => n.id)).toEqual(['c']);
    expect(grouped[PercentageLevel.LEVEL_2]).toBeUndefined();
  });
});

describe('computeAdaptiveGridLayout', () => {
  it('returns exactly one position per node, and never fewer than requested', () => {
    const bounds = { x: 0, y: 0, width: 220, height: 400 };
    const { positions } = computeAdaptiveGridLayout(5, bounds);
    expect(positions).toHaveLength(5);
  });

  it('uses the max node size when a room easily fits the nodes', () => {
    const bounds = { x: 0, y: 0, width: 320, height: 220 };
    const { nodeSize } = computeAdaptiveGridLayout(2, bounds);
    expect(nodeSize).toBe(MAX_HOUSE_NODE_SIZE);
  });

  it('shrinks node size so a crowded room never overflows its bounds', () => {
    const bounds = { x: 0, y: 0, width: 320, height: 220 };
    const count = 40;
    const { positions, nodeSize } = computeAdaptiveGridLayout(count, bounds);

    expect(nodeSize).toBeLessThan(MAX_HOUSE_NODE_SIZE);
    for (const pos of positions) {
      expect(pos.x + nodeSize).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(pos.y + nodeSize).toBeLessThanOrEqual(bounds.y + bounds.height);
    }
  });

  it('returns an empty layout for zero nodes', () => {
    const bounds = { x: 0, y: 0, width: 320, height: 220 };
    const { positions } = computeAdaptiveGridLayout(0, bounds);
    expect(positions).toEqual([]);
  });
});

describe('computeRoofGridLayout', () => {
  const triangleWidthAt = (y: number) => HOUSE_WIDTH * (y / 260) * 0.85;

  it('returns exactly one position per node', () => {
    const { positions } = computeRoofGridLayout(6);
    expect(positions).toHaveLength(6);
  });

  it('keeps every icon within the sloped roof edges and the icon area bounds', () => {
    const count = 12;
    const { positions, nodeSize } = computeRoofGridLayout(count);

    expect(positions).toHaveLength(count);
    for (const pos of positions) {
      expect(pos.y).toBeGreaterThanOrEqual(ROOF_ICON_TOP_Y);
      expect(pos.y + nodeSize).toBeLessThanOrEqual(ROOF_ICON_BOTTOM_Y);

      const rowCenterY = pos.y + nodeSize / 2;
      const halfAvailable = triangleWidthAt(rowCenterY) / 2;
      expect(pos.x).toBeGreaterThanOrEqual(HOUSE_WIDTH / 2 - halfAvailable - 0.01);
      expect(pos.x + nodeSize).toBeLessThanOrEqual(HOUSE_WIDTH / 2 + halfAvailable + 0.01);
    }
  });

  it('shrinks below the max size once the triangle is too narrow for the max size', () => {
    const { nodeSize } = computeRoofGridLayout(6);
    expect(nodeSize).toBeLessThan(MAX_HOUSE_NODE_SIZE);
  });

  it('returns an empty layout for zero nodes', () => {
    const { positions } = computeRoofGridLayout(0);
    expect(positions).toEqual([]);
  });
});
