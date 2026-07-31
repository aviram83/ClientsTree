import { PercentageLevel, PERCENTAGE_LEVEL_CONFIG, resolveLabel } from '../../config/percentageConfig';
import { HOUSE_SLOT_BOUNDS, HOUSE_WIDTH, HOUSE_HEIGHT, ROOF_HEIGHT, ROOF_LABEL_Y } from '../../lib/houseLayout';

// Static house shape (roof = full price, 2x2 room grid = discount levels).
// Rendered as a single non-interactive React Flow node so it pans/zooms with
// the canvas but never intercepts drag/click like a real node would.
const HouseBackground = () => {
  const roomLevels = [PercentageLevel.LEVEL_1, PercentageLevel.LEVEL_2, PercentageLevel.LEVEL_3, PercentageLevel.LEVEL_4];

  return (
    <svg width={HOUSE_WIDTH} height={HOUSE_HEIGHT} className="pointer-events-none select-none">
      {/* Roof */}
      <polygon
        points={`${HOUSE_WIDTH / 2},0 ${HOUSE_WIDTH},${ROOF_HEIGHT} 0,${ROOF_HEIGHT}`}
        className="fill-percentage-level-0 stroke-border"
        strokeWidth={2}
      />
      {/* Label sits above ROOF_ICON_TOP_Y (where client icons start packing),
          so it never overlaps client icons regardless of how many rows the
          trapezoid layout needs. */}
      <text
        x={HOUSE_WIDTH / 2}
        y={ROOF_LABEL_Y}
        textAnchor="middle"
        className="fill-foreground text-sm font-bold"
      >
        {resolveLabel(PERCENTAGE_LEVEL_CONFIG[PercentageLevel.LEVEL_0].labelKey)}
      </text>

      {/* Rooms */}
      {roomLevels.map((level) => {
        const bounds = HOUSE_SLOT_BOUNDS[level];
        const config = PERCENTAGE_LEVEL_CONFIG[level];
        return (
          <g key={level}>
            <rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              className={`stroke-border ${config.colorClass}`}
              strokeWidth={2}
              fillOpacity={0.15}
            />
            <text
              x={bounds.x + bounds.width / 2}
              y={bounds.y + 24}
              textAnchor="middle"
              className="fill-foreground text-sm font-bold"
            >
              {resolveLabel(config.labelKey)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default HouseBackground;
