export enum PercentageLevel {
  LEVEL_0 = "LEVEL_0",
  LEVEL_1 = "LEVEL_1",
  LEVEL_2 = "LEVEL_2",
  LEVEL_3 = "LEVEL_3",
  LEVEL_4 = "LEVEL_4",
  LEVEL_6 = "LEVEL_6",
}

// Placeholder until a real i18n library (e.g. i18next) is wired up — swapping
// this dictionary lookup for a real translator only touches this file.
const LABEL_DICTIONARY: Record<string, { he: string; en: string }> = {
  "percentageLevel.fullPrice": { he: "מחיר מלא", en: "Full price" },
  "percentageLevel.level1": { he: "15-25%", en: "15-25%" },
  "percentageLevel.level2": { he: "35%", en: "35%" },
  "percentageLevel.level3": { he: "42%", en: "42%" },
  "percentageLevel.level4": { he: "50%", en: "50%" },
  "percentageLevel.hidden": { he: "מוסתר (לא מוצג בבית)", en: "Hidden (not shown in house)" },
};

export const resolveLabel = (labelKey: string, locale: "he" | "en" = "he"): string => {
  return LABEL_DICTIONARY[labelKey]?.[locale] ?? labelKey;
};

interface PercentageLevelConfigEntry {
  labelKey: string;
  colorClass: string;
  cssVar: string;
  showsInHouse: boolean;
}

export const PERCENTAGE_LEVEL_CONFIG: Record<PercentageLevel, PercentageLevelConfigEntry> = {
  [PercentageLevel.LEVEL_0]: {
    labelKey: "percentageLevel.fullPrice",
    colorClass: "bg-percentage-level-0",
    cssVar: "--percentage-level-0",
    showsInHouse: true,
  },
  [PercentageLevel.LEVEL_1]: {
    labelKey: "percentageLevel.level1",
    colorClass: "bg-percentage-level-1",
    cssVar: "--percentage-level-1",
    showsInHouse: true,
  },
  [PercentageLevel.LEVEL_2]: {
    labelKey: "percentageLevel.level2",
    colorClass: "bg-percentage-level-2",
    cssVar: "--percentage-level-2",
    showsInHouse: true,
  },
  [PercentageLevel.LEVEL_3]: {
    labelKey: "percentageLevel.level3",
    colorClass: "bg-percentage-level-3",
    cssVar: "--percentage-level-3",
    showsInHouse: true,
  },
  [PercentageLevel.LEVEL_4]: {
    labelKey: "percentageLevel.level4",
    colorClass: "bg-percentage-level-4",
    cssVar: "--percentage-level-4",
    showsInHouse: true,
  },
  [PercentageLevel.LEVEL_6]: {
    labelKey: "percentageLevel.hidden",
    colorClass: "",
    cssVar: "",
    showsInHouse: false,
  },
};

// Levels that render inside a room (excludes the roof-level LEVEL_0 and the hidden LEVEL_6).
export const ROOM_LEVELS = [
  PercentageLevel.LEVEL_1,
  PercentageLevel.LEVEL_2,
  PercentageLevel.LEVEL_3,
  PercentageLevel.LEVEL_4,
] as const;
