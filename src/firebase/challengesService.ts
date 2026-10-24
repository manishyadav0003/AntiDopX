import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import { db } from './config';
import { calculateLevel } from './xpUtils';

export type ChallengeType = 'complete_modules' | 'earn_xp' | 'maintain_streak';

export type Challenge = {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
};

const WEEKLY_CHALLENGES: Omit<Challenge, 'progress' | 'completed'>[] = [
  {
    id: 'challenge-modules-2',
    type: 'complete_modules',
    title: 'Module Master',
    description: 'Complete 2 learning modules this week',
    target: 2,
    xpReward: 50,
  },
  {
    id: 'challenge-xp-50',
    type: 'earn_xp',
    title: 'XP Hunter',
    description: 'Earn 50 XP this week',
    target: 50,
    xpReward: 30,
  },
  {
    id: 'challenge-streak-3',
    type: 'maintain_streak',
    title: 'Consistency King',
    description: 'Maintain a 3-day streak',
    target: 3,
    xpReward: 40,
  },
];

const CHALLENGES_COLLECTION = 'challenges';

const getChallengeId = (uid: string, weekStart: string) =>
  `${uid}_${weekStart}`;

const getWeekStart = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const calculateProgress = async (
  uid: string,
  challenge: Omit<Challenge, 'progress' | 'completed'>
): Promise<number> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return 0;

  const data = userSnap.data();

  switch (challenge.type) {
    case 'complete_modules': {
      const progress = data.progress || {};
      return Object.values(progress).filter(Boolean).length;
    }
    case 'earn_xp': {
      return Number(data.xp || 0);
    }
    case 'maintain_streak': {
      return Number(data.streak || 0);
    }
    default:
      return 0;
  }
};

export const getWeeklyChallenges = async (
  uid: string
): Promise<ServiceResponse<Challenge[]>> => {
  try {
    const weekStart = getWeekStart();
    const challengeId = getChallengeId(uid, weekStart);
    const challengeDocRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    const challengeSnap = await getDoc(challengeDocRef);

    if (!challengeSnap.exists()) {
      // Generate fresh challenges for this week
      const freshChallenges: Challenge[] = await Promise.all(
        WEEKLY_CHALLENGES.map(async (template) => {
          const progress = await calculateProgress(uid, template);
          return {
            ...template,
            progress,
            completed: progress >= template.target,
          };
        })
      );

      await setDoc(challengeDocRef, {
        uid,
        weekStart,
        challenges: freshChallenges,
        createdAt: serverTimestamp(),
      });

      return { success: true, data: freshChallenges };
    }

    const data = challengeSnap.data();
    const challenges: Challenge[] = data.challenges || [];

    // Refresh progress values from live user data
    const refreshed = await Promise.all(
      challenges.map(async (challenge) => {
        const progress = await calculateProgress(uid, challenge);
        return {
          ...challenge,
          progress,
          completed: progress >= challenge.target,
        };
      })
    );

    // Update Firestore with refreshed progress
    await updateDoc(challengeDocRef, { challenges: refreshed });

    return { success: true, data: refreshed };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const claimChallengeReward = async (
  uid: string,
  challengeId: string
): Promise<ServiceResponse<number>> => {
  try {
    const weekStart = getWeekStart();
    const challengeDocRef = doc(
      db,
      CHALLENGES_COLLECTION,
      getChallengeId(uid, weekStart)
    );
    const challengeSnap = await getDoc(challengeDocRef);

    if (!challengeSnap.exists()) {
      return { success: false, error: 'No active challenges found' };
    }

    const data = challengeSnap.data();
    const challenges: Challenge[] = data.challenges || [];
    const challengeIndex = challenges.findIndex((c) => c.id === challengeId);

    if (challengeIndex === -1) {
      return { success: false, error: 'Challenge not found' };
    }

    const challenge = challenges[challengeIndex];

    if (!challenge.completed) {
      return { success: false, error: 'Challenge not yet completed' };
    }

    if (challenge.progress >= challenge.target + 1) {
      // Already claimed (we mark claimed by incrementing target)
      return { success: false, error: 'Reward already claimed' };
    }

    // Mark as claimed by incrementing target
    challenges[challengeIndex] = {
      ...challenge,
      target: challenge.target + 1,
    };

    await updateDoc(challengeDocRef, { challenges });

    // Award XP
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentXP = Number(userSnap.data().xp || 0);
      const newXP = currentXP + challenge.xpReward;
      const newLevel = calculateLevel(newXP);

      await updateDoc(userRef, { xp: newXP, level: newLevel });
    }

    return { success: true, data: challenge.xpReward };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
