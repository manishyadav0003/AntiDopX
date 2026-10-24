import type { MonthlyXP } from '../types/userProfile';
import { createEmptyMonthlyXP } from '../types/userProfile';

export const LEVEL_THRESHOLDS = {
  rookie: 0,
  competitor: 100,
  champion: 300,
  elite: 1000,
} as const;

export const calculateLevel = (xp: number): string => {
  if (xp >= LEVEL_THRESHOLDS.elite) return 'Elite Athlete';
  if (xp >= LEVEL_THRESHOLDS.champion) return 'Champion';
  if (xp >= LEVEL_THRESHOLDS.competitor) return 'Competitor';
  return 'Rookie';
};

export const getLevelRank = (level: string): number => {
  switch (level) {
    case 'Elite Athlete':
      return 4;
    case 'Champion':
      return 3;
    case 'Competitor':
      return 2;
    default:
      return 1;
  }
};

export const getNextLevelThreshold = (xp: number): number => {
  if (xp < LEVEL_THRESHOLDS.competitor) return LEVEL_THRESHOLDS.competitor;
  if (xp < LEVEL_THRESHOLDS.champion) return LEVEL_THRESHOLDS.champion;
  if (xp < LEVEL_THRESHOLDS.elite) return LEVEL_THRESHOLDS.elite;
  return LEVEL_THRESHOLDS.elite + Math.ceil((xp - LEVEL_THRESHOLDS.elite + 1) / 500) * 500;
};

export const getXpProgressPercent = (xp: number): number => {
  const threshold = getNextLevelThreshold(xp);
  const previousThreshold =
    xp < LEVEL_THRESHOLDS.competitor
      ? 0
      : xp < LEVEL_THRESHOLDS.champion
        ? LEVEL_THRESHOLDS.competitor
        : xp < LEVEL_THRESHOLDS.elite
          ? LEVEL_THRESHOLDS.champion
          : threshold - 500;

  const range = threshold - previousThreshold;
  if (range <= 0) return 100;

  return Math.min(Math.round(((xp - previousThreshold) / range) * 100), 100);
};

export const getCurrentWeek = (): keyof MonthlyXP => {
  const day = new Date().getDate();
  const week = Math.min(Math.ceil(day / 4), 7);
  return `w${week}` as keyof MonthlyXP;
};

export const normalizeMonthlyXP = (
  monthlyXP?: Partial<MonthlyXP>
): MonthlyXP => ({
  ...createEmptyMonthlyXP(),
  ...(monthlyXP || {}),
});

export const getTotalMonthlyXP = (monthlyXP: MonthlyXP): number =>
  Object.values(monthlyXP).reduce((sum, value) => sum + value, 0);
