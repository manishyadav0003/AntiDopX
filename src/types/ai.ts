export type AIChatRole = 'user' | 'assistant' | 'system';

export type AIChatMessage = {
  id: string;
  role: AIChatRole;
  content: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  groundingSources?: string[];
  isError?: boolean;
};

export type AthleteLearningContext = {
  name: string;
  sport: string;
  level: string;
  xp: number;
  streak: number;
  completedModules: string[];
  weakTopics: string[];
  recentQuizScores: Record<string, number>;
  language: 'en' | 'hi';
};

export type AICoachRequest = {
  message: string;
  conversationHistory?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  athleteContext?: AthleteLearningContext;
  currentTopic?: string;
  language?: 'en' | 'hi';
};

export type AICoachResponse = {
  reply: string;
  suggestedFollowUps: string[];
  relevantModuleSlug?: string;
  sourceReferences: string[];
  language: 'en' | 'hi';
};

export type AIGeneratedQuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
};
