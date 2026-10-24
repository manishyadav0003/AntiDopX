import type { UserRole } from './roles';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export type AdminUser = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  sport: string;
  status: AccountStatus;
  xp: number;
  level: string;
  streak: number;
  createdAt: string;
  lastLoginDate?: string;
  assignedCoachId?: string;
  assignedCoachName?: string;
  completedModulesCount: number;
};

export type AdminDashboardMetrics = {
  totalUsers: number;
  totalAthletes: number;
  totalCoaches: number;
  activeUsersThisWeek: number;
  totalModules: number;
  totalQuestions: number;
  totalMedicines: number;
  recentAuditEventsCount: number;
  pendingActionsCount: number;
};

export type AdminAuditAction =
  | 'ASSIGN_COACH'
  | 'REMOVE_COACH'
  | 'UPDATE_USER_ROLE'
  | 'UPDATE_ACCOUNT_STATUS'
  | 'UPDATE_MODULE'
  | 'CREATE_QUESTION'
  | 'UPDATE_MEDICINE'
  | 'SYSTEM_SETTINGS_CHANGE';

export type AdminAuditLog = {
  id: string;
  action: AdminAuditAction;
  adminId: string;
  adminEmail?: string;
  targetEntity: string;
  details: string;
  timestamp: string;
};

export type AdminCurriculumModule = {
  id: string;
  title: string;
  slug: string;
  description: string;
  xpReward: number;
  sectionsCount: number;
  questionsCount: number;
  published: boolean;
};

export type AdminQuizQuestion = {
  id: string;
  moduleKey: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'ROOKIE' | 'INTERMEDIATE' | 'ADVANCED';
};

export type AdminMedicineRecord = {
  id: string;
  brandName: string;
  genericName: string;
  category: string;
  wadaStatus: 'PROHIBITED' | 'CONDITIONAL' | 'PERMITTED';
  substanceClass: string;
  barcode?: string;
  verifiedDate: string;
  verifiedBy: string;
  source: string;
  inCompetitionOnly?: boolean;
};

export type AdminSystemSettings = {
  adminUid: string;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  scannerEnabled: boolean;
  aiCoachEnabled: boolean;
  minQuizPassingScore: number;
  lastUpdated: string;
};
