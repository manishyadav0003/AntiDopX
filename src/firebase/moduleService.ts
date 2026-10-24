import {
  learningModules,
  type LearningModule,
  type ModuleKey,
} from '../learning/modules';
import type { ModuleProgress, QuizScores } from '../types/userProfile';

export type ModuleStatus =
  | 'COMPLETED'
  | 'AVAILABLE'
  | 'IN PROGRESS'
  | 'UNLOCKED'
  | 'LOCKED';

export type ModuleTimelineEntry = {
  module: LearningModule;
  status: ModuleStatus;
  lessonCount: number;
  xpReward: number;
  isLocked: boolean;
  isPressable: boolean;
};

const MODULE_CHART_COLORS: Record<ModuleKey, string> = {
  antiDopingBasics: '#22C55E',
  wadaRules: '#2563EB',
  testingProcedures: '#F59E0B',
  tue: '#06B6D4',
  supplements: '#8B5CF6',
  prohibitedSubstances: '#EF4444',
  prohibitedMethods: '#EC4899',
  dopingControlProcess: '#14B8A6',
  athleteRightsResponsibilities: '#6366F1',
  medicationAwareness: '#F97316',
  nutritionPerformance: '#10B981',
  dopingRisks: '#DC2626',
  ethicsInSport: '#84CC16',
  cleanSport: '#3B82F6',
  whereToGetHelp: '#A855F7',
  youngAthleteAwareness: '#EAB308',
};

export const getModuleChartColor = (moduleKey: ModuleKey): string =>
  MODULE_CHART_COLORS[moduleKey] || '#06B6D4';

export const isModuleUnlocked = (
  moduleIndex: number,
  progress: ModuleProgress
): boolean => {
  if (moduleIndex === 0) return true;

  const previousModule = learningModules[moduleIndex - 1];
  return Boolean(progress[previousModule.moduleKey]);
};

export const getModuleStatus = (
  moduleIndex: number,
  progress: ModuleProgress,
  firstIncompleteIndex: number
): ModuleStatus => {
  const module = learningModules[moduleIndex];
  const isCompleted = Boolean(progress[module.moduleKey]);

  if (isCompleted) return 'COMPLETED';
  if (!isModuleUnlocked(moduleIndex, progress)) return 'LOCKED';
  if (moduleIndex === firstIncompleteIndex) return 'IN PROGRESS';
  return 'UNLOCKED';
};

export const getModuleTimeline = (
  progress: ModuleProgress
): ModuleTimelineEntry[] => {
  const firstIncompleteIndex = learningModules.findIndex(
    (module) => !progress[module.moduleKey]
  );

  return learningModules.map((module, index) => {
    const isLocked = !isModuleUnlocked(index, progress);
    const status = getModuleStatus(
      index,
      progress,
      firstIncompleteIndex
    );

    return {
      module,
      status,
      lessonCount: module.sections.length,
      xpReward: module.xpReward,
      isLocked,
      isPressable: !isLocked,
    };
  });
};

export const getCompletedModuleCount = (progress: ModuleProgress): number =>
  learningModules.filter((module) => progress[module.moduleKey]).length;

export const getCompletionPercent = (progress: ModuleProgress): number =>
  Math.round((getCompletedModuleCount(progress) / learningModules.length) * 100);

export const getWeakestModule = (
  progress: ModuleProgress,
  quizScores: QuizScores = {}
): LearningModule => {
  let weakest = learningModules[0];
  let lowestScore = Number.POSITIVE_INFINITY;

  learningModules.forEach((module) => {
    if (progress[module.moduleKey]) return;

    const score = quizScores[module.moduleKey];
    const effectiveScore =
      score === undefined ? -1 : score;

    if (effectiveScore < lowestScore) {
      lowestScore = effectiveScore;
      weakest = module;
    }
  });

  if (lowestScore === Number.POSITIVE_INFINITY) {
    return (
      learningModules.find((module) => !progress[module.moduleKey]) ||
      learningModules[learningModules.length - 1]
    );
  }

  return weakest;
};

export const getRecommendedModule = (
  progress: ModuleProgress,
  quizScores: QuizScores = {}
): LearningModule => getWeakestModule(progress, quizScores);

export const getModuleCompletionChart = (
  quizScores: QuizScores = {},
  progress: ModuleProgress = {} as ModuleProgress
) =>
  learningModules.map((module) => ({
    moduleKey: module.moduleKey,
    title: module.shortTitle,
    progress: progress[module.moduleKey]
      ? 100
      : quizScores[module.moduleKey] || 0,
    color: getModuleChartColor(module.moduleKey),
  }));
