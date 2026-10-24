import {
  learningModules,
  type InteractiveQuizQuestion,
  type LearningModuleDefinition,
  type ModuleKey,
} from '../learning/modules';
import type { QuizScores } from '../types/userProfile';

export type QuizSessionMode = 'rapid_fire' | 'topic_challenge' | 'adaptive_revision';

export type AdaptiveQuizConfig = {
  mode: QuizSessionMode;
  targetModuleKey?: ModuleKey;
  targetQuestionCount?: number;
  timeLimitSeconds?: number;
};

export type AdaptiveQuizSession = {
  title: string;
  subtitle: string;
  questions: InteractiveQuizQuestion[];
  timeLimitSeconds: number;
  possibleXP: number;
  targetTopics: string[];
};

export const getAllQuestionBank = (): InteractiveQuizQuestion[] => {
  return learningModules.flatMap((m) => m.quiz.questions);
};

export const getQuestionsByTopic = (moduleKey: ModuleKey): InteractiveQuizQuestion[] => {
  const module = learningModules.find((m) => m.moduleKey === moduleKey);
  return module ? module.quiz.questions : [];
};

export const generateAdaptiveQuizSession = (
  quizScores: QuizScores = {},
  config: AdaptiveQuizConfig
): AdaptiveQuizSession => {
  const allQuestions = getAllQuestionBank();
  const count = config.targetQuestionCount || 5;

  if (config.mode === 'topic_challenge' && config.targetModuleKey) {
    const topicQuestions = getQuestionsByTopic(config.targetModuleKey);
    const selected = topicQuestions.slice(0, count);
    const module = learningModules.find((m) => m.moduleKey === config.targetModuleKey);

    return {
      title: `${module?.shortTitle || 'Topic'} Challenge`,
      subtitle: `Master ${module?.title || 'this topic'} with targeted questions`,
      questions: selected.length > 0 ? selected : allQuestions.slice(0, count),
      timeLimitSeconds: config.timeLimitSeconds || 20,
      possibleXP: 100,
      targetTopics: [module?.title || 'General'],
    };
  }

  if (config.mode === 'adaptive_revision') {
    // Identify weak topics (score < 80% or uncompleted)
    const weakModuleKeys: ModuleKey[] = [];
    Object.entries(quizScores).forEach(([key, score]) => {
      if ((score ?? 0) < 80) {
        weakModuleKeys.push(key as ModuleKey);
      }
    });

    const targetedQuestions: InteractiveQuizQuestion[] = [];

    // Prioritize weak topics
    weakModuleKeys.forEach((key) => {
      const qs = getQuestionsByTopic(key);
      if (qs.length > 0) targetedQuestions.push(...qs);
    });

    // Fill remaining with mixed difficulty
    if (targetedQuestions.length < count) {
      const remaining = allQuestions.filter((q) => !targetedQuestions.some((t) => t.id === q.id));
      targetedQuestions.push(...remaining.slice(0, count - targetedQuestions.length));
    }

    const finalQuestions = targetedQuestions.slice(0, count);

    return {
      title: 'Adaptive Revision Challenge',
      subtitle: 'Targeted practice in your areas of growth',
      questions: finalQuestions,
      timeLimitSeconds: 25,
      possibleXP: 120,
      targetTopics: weakModuleKeys.length > 0 ? weakModuleKeys : ['All Topics'],
    };
  }

  // Default: Rapid-Fire Quiz Arena
  // Shuffle all questions
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return {
    title: 'Rapid-Fire Quiz Arena',
    subtitle: 'Beat the clock & level up your clean sport IQ',
    questions: selected,
    timeLimitSeconds: config.timeLimitSeconds || 20,
    possibleXP: 150,
    targetTopics: ['All Topics'],
  };
};

export const getRecommendedNextStep = (
  quizScores: QuizScores = {},
  progress: Record<string, boolean> = {}
): { title: string; route: `/modules/${LearningModuleDefinition['slug']}`; reason: string } => {
  // Check if any attempted module had score < 80
  for (const module of learningModules) {
    const score = quizScores[module.moduleKey];
    if (score !== undefined && score < 80) {
      return {
        title: module.title,
        route: module.route,
        reason: `Your latest score in this topic was ${score}%. Revise to boost your accuracy.`,
      };
    }
  }

  // Next incomplete module
  const nextIncomplete = learningModules.find((m) => !progress[m.moduleKey]);
  if (nextIncomplete) {
    return {
      title: nextIncomplete.title,
      route: nextIncomplete.route,
      reason: 'Continue your progressive learning journey.',
    };
  }

  // All complete
  const first = learningModules[0];
  return {
    title: first.title,
    route: first.route,
    reason: 'Outstanding work! Keep your knowledge sharp with a revision session.',
  };
};
