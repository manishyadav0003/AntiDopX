import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';

import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import type { UserProfile } from '../types/userProfile';
import {
  createEmptyMonthlyXP,
  defaultModuleProgress,
} from '../types/userProfile';
import { defaultAchievements } from './achievementService';
import { db } from './config';
import { LOCAL_PROFILE_STORAGE_KEY } from './firestoreService';
import { getTotalMonthlyXP, normalizeMonthlyXP } from './xpUtils';

const parseUserProfile = (
  uid: string,
  data: Record<string, unknown>
): UserProfile => ({
  uid,
  name: String(data.name || 'Athlete'),
  email: String(data.email || ''),
  age: Number(data.age || 0),
  sport: String(data.sport || 'Unknown'),
  xp: Number(data.xp || 0),
  level: String(data.level || 'Rookie'),
  streak: Number(data.streak || 0),
  lastLoginDate: data.lastLoginDate
    ? String(data.lastLoginDate)
    : undefined,
  lastSpinDate: data.lastSpinDate
    ? String(data.lastSpinDate)
    : undefined,
  progress: {
    ...defaultModuleProgress(),
    ...((data.progress as UserProfile['progress']) || {}),
  },
  completedModules: (data.completedModules as UserProfile['completedModules']) || {},
  quizScores: (data.quizScores as UserProfile['quizScores']) || {},
  quizArenaScores: (data.quizArenaScores as number[]) || [],
  achievements: {
    ...defaultAchievements,
    ...((data.achievements as UserProfile['achievements']) || {}),
  },
  monthlyXP: normalizeMonthlyXP(
    data.monthlyXP as UserProfile['monthlyXP']
  ),
  dailyMission: data.dailyMission as UserProfile['dailyMission'],
  recentActivity: (data.recentActivity as UserProfile['recentActivity']) || [],
  savedMedicines: (data.savedMedicines as UserProfile['savedMedicines']) || [],
  createdAt: String(data.createdAt || new Date().toISOString()),
});

export const getUserProfile = async (
  uid: string
): Promise<ServiceResponse<UserProfile>> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Try local storage fallback
      const cached = await AsyncStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.uid === uid || !parsed.uid) {
            return { success: true, data: parseUserProfile(uid, parsed) };
          }
        } catch {}
      }

      return {
        success: false,
        error: 'User profile not found',
      };
    }

    const profile = parseUserProfile(uid, docSnap.data());
    // Keep local cache fresh
    void AsyncStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));

    return {
      success: true,
      data: profile,
    };
  } catch (error: unknown) {
    // If Firestore fails (permission denied or network), attempt to serve from local storage
    try {
      const cached = await AsyncStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return { success: true, data: parseUserProfile(uid, parsed) };
      }
    } catch {}

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const getUserMonthlyXPTotal = (profile: UserProfile): number =>
  getTotalMonthlyXP(profile.monthlyXP || createEmptyMonthlyXP());

export const getLocalProfile = async (uid?: string): Promise<UserProfile | null> => {
  try {
    const cached = await AsyncStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parseUserProfile(uid || parsed.uid || 'current-athlete', parsed);
    }
  } catch {}
  return null;
};

export const saveLocalProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
};

export const updateLocalProfileData = async (
  uid: string,
  partial: Partial<UserProfile>
): Promise<UserProfile> => {
  const existing = (await getLocalProfile(uid)) || parseUserProfile(uid, {});
  const updated: UserProfile = {
    ...existing,
    ...partial,
    progress: {
      ...existing.progress,
      ...(partial.progress || {}),
    },
    completedModules: {
      ...existing.completedModules,
      ...(partial.completedModules || {}),
    },
    quizScores: {
      ...existing.quizScores,
      ...(partial.quizScores || {}),
    },
    achievements: {
      ...existing.achievements,
      ...(partial.achievements || {}),
    },
    recentActivity: partial.recentActivity || existing.recentActivity,
  };
  await saveLocalProfile(updated);
  return updated;
};
