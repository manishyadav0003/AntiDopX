import { getFunctions, httpsCallable } from 'firebase/functions';

import { app } from './config';

const functions = getFunctions(app, 'asia-south1');

export type QuizArenaAnswer = {
  questionId: string;
  optionIndex: number;
};

export type QuizArenaSubmissionResult = {
  score: number;
  percentage: number;
  xpEarned: number;
  level: string;
  totalXP: number;
};

const submitQuizArena = httpsCallable<
  { answers: QuizArenaAnswer[] },
  QuizArenaSubmissionResult
>(functions, 'submitQuizArena');

export const submitQuizArenaAnswers = async (
  answers: QuizArenaAnswer[]
): Promise<QuizArenaSubmissionResult> => {
  const response = await submitQuizArena({ answers });
  return response.data;
};
