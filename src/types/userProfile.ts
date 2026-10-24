import type { Achievements } from '../firebase/achievementService';
import type { ModuleKey } from './learning';
import type { UserRole } from './roles';

export type ModuleProgress = Record<ModuleKey, boolean>;

export type QuizScores = Partial<Record<ModuleKey, number>>;

export type MonthlyXP = {
  w1: number;
  w2: number;
  w3: number;
  w4: number;
  w5: number;
  w6: number;
  w7: number;
};

export type DailyMissionProgress = {
  date: string;
  scenariosCompleted: number;
  quizQuestionsAnswered: number;
};

export type RecentActivityEntry = {
  type: 'module' | 'quiz' | 'scenario' | 'scan' | 'challenge' | 'chat';
  description: string;
  timestamp: string;
};

export type SavedMedicine = {
  drugName: string;
  status: string;
  guidance: string;
  scannedAt: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  age: number;
  sport: string;
  role?: UserRole;
  assignedCoachId?: string;
  assignedCoachName?: string;
  language?: 'en' | 'hi';
  xp: number;
  level: string;
  streak: number;
  lastLoginDate?: string;
  lastSpinDate?: string;
  progress: ModuleProgress;
  completedModules?: Partial<Record<ModuleKey, boolean>>;
  quizScores?: QuizScores;
  quizArenaScores?: number[];
  achievements: Achievements;
  monthlyXP?: MonthlyXP;
  dailyMission?: DailyMissionProgress;
  recentActivity?: RecentActivityEntry[];
  savedMedicines?: SavedMedicine[];
  createdAt: string;
};

export const defaultModuleProgress = (): ModuleProgress => ({
  antiDopingBasics: false,
  wadaRules: false,
  testingProcedures: false,
  tue: false,
  supplements: false,
  prohibitedSubstances: false,
  prohibitedMethods: false,
  dopingControlProcess: false,
  athleteRightsResponsibilities: false,
  medicationAwareness: false,
  nutritionPerformance: false,
  dopingRisks: false,
  ethicsInSport: false,
  cleanSport: false,
  whereToGetHelp: false,
  youngAthleteAwareness: false,
});

export const createEmptyMonthlyXP = (): MonthlyXP => ({
  w1: 0,
  w2: 0,
  w3: 0,
  w4: 0,
  w5: 0,
  w6: 0,
  w7: 0,
});
