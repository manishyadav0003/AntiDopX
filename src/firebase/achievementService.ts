import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { learningModules } from '../learning/modules';
import type { ServiceResponse } from '../types/serviceResponse';
import { db } from './config';
import { getLocalProfile, updateLocalProfileData } from './userService';

export type AchievementKey =
  | 'firstModule'
  | 'threeModules'
  | 'fiveModules'
  | 'xp100'
  | 'streak7';

export type Achievements = Record<AchievementKey, boolean>;

export type AchievementEvaluation = {
  achievements: Achievements;
  completedModules: number;
  newlyUnlocked: string[];
};

export const defaultAchievements: Achievements = {
  firstModule: false,
  threeModules: false,
  fiveModules: false,
  xp100: false,
  streak7: false,
};

export const achievementLabels: Record<AchievementKey, string> = {
  firstModule: 'First Module',
  threeModules: '3 Modules Completed',
  fiveModules: '5 Modules Completed',
  xp100: '100 XP Earned',
  streak7: '7 Day Streak',
};

const achievementKeys = Object.keys(
  defaultAchievements
) as AchievementKey[];

const normalizeAchievements = (
  achievements?: Partial<Achievements>
): Achievements => ({
  ...defaultAchievements,
  ...(achievements || {}),
});

export const getAchievements = async (
  uid: string
): Promise<ServiceResponse<Achievements>> => {
  try {
    const userRef = doc(db, 'users', uid);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return {
          success: true,
          data: normalizeAchievements(userSnap.data().achievements),
        };
      }
    } catch {}

    const local = await getLocalProfile(uid);
    return {
      success: true,
      data: normalizeAchievements(local?.achievements),
    };
  } catch {
    return {
      success: true,
      data: defaultAchievements,
    };
  }
};

export const evaluateAchievements = async (
  uid: string
): Promise<ServiceResponse<AchievementEvaluation>> => {
  try {
    const userRef = doc(db, 'users', uid);
    let userData: any = {};
    let foundInFirestore = false;

    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userData = userSnap.data();
        foundInFirestore = true;
      }
    } catch (e) {
      console.warn('Firestore getDoc failed in evaluateAchievements, checking local cache:', e);
    }

    if (!foundInFirestore) {
      const local = await getLocalProfile(uid);
      if (local) {
        userData = local;
      }
    }

    const progress = userData.progress || {};
    const existingAchievements = normalizeAchievements(
      userData.achievements
    );
    const completedModules = learningModules.filter((module) =>
      Boolean(progress[module.moduleKey])
    ).length;
    const xp = Number(userData.xp || 0);
    const streak = Number(userData.streak || 0);

    const nextAchievements: Achievements = {
      firstModule:
        existingAchievements.firstModule ||
        completedModules >= 1,
      threeModules:
        existingAchievements.threeModules ||
        completedModules >= 3,
      fiveModules:
        existingAchievements.fiveModules ||
        completedModules >= 5,
      xp100:
        existingAchievements.xp100 ||
        xp >= 100,
      streak7:
        existingAchievements.streak7 ||
        streak >= 7,
    };

    const newlyUnlocked = achievementKeys
      .filter(
        (key) =>
          !existingAchievements[key] &&
          nextAchievements[key]
      )
      .map((key) => achievementLabels[key]);

    const hasChanges = achievementKeys.some(
      (key) =>
        existingAchievements[key] !== nextAchievements[key]
    );

    if (hasChanges) {
      // Save locally first
      await updateLocalProfileData(uid, {
        achievements: nextAchievements,
      });

      // Try sync to Firestore
      try {
        await updateDoc(userRef, {
          achievements: nextAchievements,
        });
      } catch (firestoreError: any) {
        console.warn('Firestore updateDoc skipped in evaluateAchievements:', firestoreError?.message);
      }
    }

    return {
      success: true,
      data: {
        achievements: nextAchievements,
        completedModules,
        newlyUnlocked,
      },
    };
  } catch (error: unknown) {
    console.warn('Handling evaluateAchievements fallback:', error);
    return {
      success: true,
      data: {
        achievements: defaultAchievements,
        completedModules: 0,
        newlyUnlocked: [],
      },
    };
  }
};
