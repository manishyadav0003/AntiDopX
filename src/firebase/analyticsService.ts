import { doc, getDoc } from 'firebase/firestore';

import { learningModules } from '../learning/modules';
import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import { createEmptyMonthlyXP } from '../types/userProfile';
import { db } from './config';
import {
  getModuleCompletionChart,
  getRecommendedModule,
  getWeakestModule,
} from './moduleService';
import { getTotalMonthlyXP, normalizeMonthlyXP } from './xpUtils';

export type AnalyticsData = {
  totalXP: number;
  currentLevel: string;
  currentStreak: number;
  knowledgeGrowth: number;
  quizAccuracy: number;
  completedModules: number;
  totalModules: number;
  totalQuizzes: number;
  completionPercentage: number;
  monthlyXP: ReturnType<typeof createEmptyMonthlyXP>;
  totalMonthlyXP: number;
  monthlyGrowthPercent: number;
  moduleCompletion: {
    title: string;
    progress: number;
    color: string;
  }[];
  weakArea: {
    title: string;
    score: number;
    route: string;
    moduleKey: string;
  };
  recommendedModule: {
    title: string;
    route: string;
  };
};

const getAverageQuizScore = (
  moduleScores: number[],
  arenaScores: number[]
): number => {
  const allScores = [...moduleScores, ...arenaScores];

  if (allScores.length === 0) return 0;

  return (
    allScores.reduce((sum, score) => sum + score, 0) / allScores.length
  );
};

export const getAnalytics = async (
  uid: string
): Promise<ServiceResponse<AnalyticsData>> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const data = snap.data();
    const progress = {
      antiDopingBasics: false,
      wadaRules: false,
      testingProcedures: false,
      tue: false,
      supplements: false,
      ...(data.progress || {}),
    };
    const quizScores = data.quizScores || {};
    const quizArenaScores = (data.quizArenaScores as number[]) || [];
    const completedModules = learningModules.filter(
      (module) => progress[module.moduleKey]
    ).length;
    const totalModules = learningModules.length;
    const moduleScoreValues = Object.values(quizScores) as number[];
    const averageScore = getAverageQuizScore(
      moduleScoreValues,
      quizArenaScores
    );
    const monthlyXP = normalizeMonthlyXP(data.monthlyXP);
    const totalMonthlyXP = getTotalMonthlyXP(monthlyXP);
    const moduleCompletion = getModuleCompletionChart(quizScores, progress);
    const weakestModule = getWeakestModule(progress, quizScores);
    const weakestScore = progress[weakestModule.moduleKey]
      ? 100
      : quizScores[weakestModule.moduleKey] || 0;
    const recommendedModule = getRecommendedModule(progress, quizScores);

    return {
      success: true,
      data: {
        totalXP: Number(data.xp || 0),
        currentLevel: String(data.level || 'Rookie'),
        currentStreak: Number(data.streak || 0),
        knowledgeGrowth: Math.round((completedModules / totalModules) * 100),
        quizAccuracy: Math.round(averageScore),
        completedModules,
        totalModules,
        totalQuizzes: moduleScoreValues.length + quizArenaScores.length,
        completionPercentage: Math.round(
          (completedModules / totalModules) * 100
        ),
        monthlyXP,
        totalMonthlyXP,
        monthlyGrowthPercent: 0,
        moduleCompletion,
        weakArea: {
          title: `${weakestModule.shortTitle} Needs Attention`,
          score: weakestScore,
          route: weakestModule.route,
          moduleKey: weakestModule.moduleKey,
        },
        recommendedModule: {
          title: recommendedModule.title,
          route: recommendedModule.route,
        },
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
