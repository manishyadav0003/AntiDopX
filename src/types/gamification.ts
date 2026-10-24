export type BadgeCategory = 'LEARNING' | 'STREAK' | 'MASTERY' | 'SAFETY' | 'CHAMPION';

export type GamificationBadge = {
  key: string;
  title: string;
  description: string;
  category: BadgeCategory;
  emoji: string;
  xpBonus: number;
  unlocked: boolean;
  unlockedAt?: string;
};

export type DailyMission = {
  date: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardXP: number;
  completed: boolean;
  endsInHours: number;
};

export type LeaderboardItem = {
  uid: string;
  displayName: string;
  sport: string;
  xp: number;
  level: string;
  streak: number;
  rank: number;
};

export type GamificationState = {
  xp: number;
  level: string;
  nextLevelXP: number;
  xpProgressPercent: number;
  streak: number;
  lastLoginDate: string;
  badges: GamificationBadge[];
  dailyMission: DailyMission;
};
