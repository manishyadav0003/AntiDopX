export type UserRole = 'ATHLETE' | 'COACH' | 'ADMIN';

export type RolePermission =
  | 'read:own_profile'
  | 'update:own_profile'
  | 'take_quiz'
  | 'scan_medicine'
  | 'chat_with_coach'
  | 'read:assigned_athletes'
  | 'manage:assigned_athletes'
  | 'chat_with_athletes'
  | 'manage:all_users'
  | 'manage:curriculum'
  | 'manage:medicines'
  | 'view_analytics';

export type CoachAssignment = {
  id: string;
  coachId: string;
  coachName: string;
  coachEmail: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  sport: string;
  assignedAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
};

export type CoachAthleteSummary = {
  uid: string;
  name: string;
  email: string;
  sport: string;
  level: string;
  xp: number;
  streak: number;
  completedModulesCount: number;
  totalModulesCount: number;
  averageQuizScore: number;
  weakTopics: string[];
  lastActive: string;
  needsAttention: boolean;
};

export type CoachDashboardMetrics = {
  totalAthletes: number;
  activeThisWeek: number;
  averageProgressPercent: number;
  averageQuizScore: number;
  completedModulesTotal: number;
  athletesNeedingAttention: CoachAthleteSummary[];
};
