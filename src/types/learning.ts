export type ModuleKey =
  | 'antiDopingBasics'
  | 'wadaRules'
  | 'testingProcedures'
  | 'tue'
  | 'supplements'
  | 'prohibitedSubstances'
  | 'prohibitedMethods'
  | 'dopingControlProcess'
  | 'athleteRightsResponsibilities'
  | 'medicationAwareness'
  | 'nutritionPerformance'
  | 'dopingRisks'
  | 'ethicsInSport'
  | 'cleanSport'
  | 'whereToGetHelp'
  | 'youngAthleteAwareness';

export type ModuleSlug =
  | 'anti-doping-basics'
  | 'wada-rules'
  | 'testing-procedures'
  | 'tue'
  | 'supplements'
  | 'prohibited-substances'
  | 'prohibited-methods'
  | 'doping-control-process'
  | 'athlete-rights-responsibilities'
  | 'medication-awareness'
  | 'nutrition-performance'
  | 'doping-risks'
  | 'ethics-in-sport'
  | 'clean-sport'
  | 'where-to-get-help'
  | 'young-athlete-awareness';

export type QuestionType = 'multiple_choice' | 'true_false' | 'scenario' | 'rapid_fire';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type InteractiveQuizQuestion = {
  id: string;
  moduleKey: ModuleKey;
  question: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  contextHint?: string;
  scenarioContext?: string;
  estimatedTimeSeconds?: number;
};

export type LessonSection = {
  title: string;
  content: string[];
  keyTakeaway?: string;
  proTip?: string;
};

export type LearningModuleDefinition = {
  slug: ModuleSlug;
  moduleKey: ModuleKey;
  route: `/modules/${ModuleSlug}`;
  title: string;
  shortTitle: string;
  category: 'Fundamentals' | 'Regulations' | 'Health & Safety' | 'Values & Ethics';
  xpReward: number;
  badgeKey?: string;
  sections: LessonSection[];
  quiz: {
    passingScore: number;
    questions: InteractiveQuizQuestion[];
  };
};

export type ModuleProgressState = Record<ModuleKey, boolean>;

export type QuizAttemptRecord = {
  attemptId: string;
  uid: string;
  moduleKey: ModuleKey;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  xpEarned: number;
  completedAt: string;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
};
