export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

export type QuizDefinition = {
  passingScore: number;
  questions: QuizQuestion[];
};

export type QuizAnswers = Record<string, number>;

export type QuizResult = {
  correctCount: number;
  totalQuestions: number;
  score: number;
  passed: boolean;
};

export const gradeQuiz = (
  questions: QuizQuestion[],
  answers: QuizAnswers,
  passingScore: number
): QuizResult => {
  const correctCount = questions.reduce((total, question) => {
    return answers[question.id] === question.correctOptionIndex
      ? total + 1
      : total;
  }, 0);

  const totalQuestions = questions.length;
  const score =
    totalQuestions === 0
      ? 100
      : Math.round((correctCount / totalQuestions) * 100);

  return {
    correctCount,
    totalQuestions,
    score,
    passed: score >= passingScore,
  };
};
