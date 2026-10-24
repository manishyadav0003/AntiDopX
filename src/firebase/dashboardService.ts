import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import {
  defaultModuleProgress,
  type RecentActivityEntry,
  type UserProfile,
} from '../types/userProfile';
import type { AchievementKey } from './achievementService';
import { achievementLabels } from './achievementService';
import type { Challenge } from './challengesService';
import { getWeeklyChallenges } from './challengesService';
import { getLeaderboard } from './leaderboardService';
import {
  getCompletionPercent,
  getModuleTimeline,
  getRecommendedModule,
} from './moduleService';
import { getUserProfile } from './userService';
import {
  getNextLevelThreshold,
  getXpProgressPercent,
} from './xpUtils';

export type DashboardBadge = {
  key: AchievementKey;
  label: string;
  icon: string;
  unlocked: boolean;
};

export type DashboardEvent = {
  dayLabel: string;
  title: string;
  subtitle: string;
  badge: 'LIVE' | 'NEW';
};

export type DashboardData = {
  name: string;
  sport: string;
  age: string;
  xp: number;
  level: string;
  streak: number;
  xpCap: number;
  xpProgressPercent: number;
  completedModuleCount: number;
  totalModules: number;
  completionPercent: number;
  dailyMission: {
    description: string;
    progressPercent: number;
    rewardXP: number;
    endsInHours: number;
  };
  recommendedModule: {
    title: string;
    route: string;
  };
  recentActivity: RecentActivityEntry[];
  badges: DashboardBadge[];
  events: DashboardEvent[];
  rank: {
    position: number;
    totalUsers: number;
    percentileLabel: string;
  } | null;
};

const BADGE_ICONS: Record<AchievementKey, string> = {
  firstModule: 'medal',
  threeModules: 'shield-check',
  fiveModules: 'trophy',
  xp100: 'lightning-bolt',
  streak7: 'fire',
};

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const getEndsInHours = (): number => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return Math.max(1, Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)));
};

const getDailyMissionProgress = (profile: UserProfile) => {
  const today = new Date().toISOString().split('T')[0];
  const mission = profile.dailyMission;

  if (!mission || mission.date !== today) {
    return {
      scenariosCompleted: 0,
      quizQuestionsAnswered: 0,
    };
  }

  return mission;
};

const buildEventsFromChallenges = (
  challenges: Challenge[]
): DashboardEvent[] => {
  if (!challenges || challenges.length === 0) return [];

  const todayIndex = new Date().getDay();

  return challenges.slice(0, 2).map((challenge, index) => ({
    dayLabel: DAY_LABELS[(todayIndex + index + 1) % DAY_LABELS.length],
    title: challenge.title,
    subtitle: challenge.description,
    badge: index === 0 ? 'LIVE' : 'NEW',
  }));
};

export const getDashboardData = async (
  uid: string
): Promise<ServiceResponse<DashboardData>> => {
  try {
    const [profileResult, leaderboardResult, challengesResult] =
      await Promise.all([
        getUserProfile(uid),
        getLeaderboard(100),
        getWeeklyChallenges(uid),
      ]);

    if (!profileResult.success) {
      return profileResult;
    }

    const profile = profileResult.data;
    const progress = profile.progress || defaultModuleProgress();
    const timeline = getModuleTimeline(progress);
    const recommended = getRecommendedModule(progress, profile.quizScores || {});
    const dailyMissionProgress = getDailyMissionProgress(profile);
    const scenarioTarget = 1;
    const quizTarget = 5;
    const scenarioProgress = Math.min(
      dailyMissionProgress.scenariosCompleted / scenarioTarget,
      1
    );
    const quizProgress = Math.min(
      dailyMissionProgress.quizQuestionsAnswered / quizTarget,
      1
    );
    const missionProgressPercent = Math.round(
      ((scenarioProgress + quizProgress) / 2) * 100
    );

    const badges: DashboardBadge[] = (
      Object.keys(BADGE_ICONS) as AchievementKey[]
    ).map((key) => ({
      key,
      label: achievementLabels[key],
      icon: BADGE_ICONS[key],
      unlocked: Boolean(profile.achievements?.[key]),
    }));

    let rank: DashboardData['rank'] = null;

    if (leaderboardResult.success) {
      const index = leaderboardResult.data.findIndex(
        (entry) => entry.uid === uid
      );

      if (index >= 0) {
        const totalUsers = leaderboardResult.data.length;
        const percentile = Math.max(
          1,
          Math.round(((totalUsers - index) / totalUsers) * 100)
        );

        rank = {
          position: index + 1,
          totalUsers,
          percentileLabel: `Top ${percentile}%`,
        };
      }
    }

    const events =
      challengesResult.success
        ? buildEventsFromChallenges(challengesResult.data)
        : [];

    return {
      success: true,
      data: {
        name: profile.name,
        sport: profile.sport,
        age: String(profile.age || ''),
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        xpCap: getNextLevelThreshold(profile.xp),
        xpProgressPercent: getXpProgressPercent(profile.xp),
        completedModuleCount: timeline.filter((entry) => entry.status === 'COMPLETED')
          .length,
        totalModules: timeline.length,
        completionPercent: getCompletionPercent(progress),
        dailyMission: {
          description: 'Complete 1 Scenario + 5 Quiz Questions',
          progressPercent: missionProgressPercent,
          rewardXP: 150,
          endsInHours: getEndsInHours(),
        },
        recommendedModule: {
          title: recommended.title,
          route: recommended.route,
        },
        recentActivity: profile.recentActivity || [],
        badges,
        events,
        rank,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
