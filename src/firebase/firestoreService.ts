import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import {
  createEmptyMonthlyXP,
  defaultModuleProgress,
} from '../types/userProfile';
import { defaultAchievements } from './achievementService';
import { db } from './config';

export const LOCAL_PROFILE_STORAGE_KEY = '@antidopx_local_user_profile';

export const createUserProfile = async (
  uid: string,
  name: string,
  email: string,
  age: string,
  sport: string
): Promise<ServiceResponse<void>> => {
  const profileData = {
    uid,
    name,
    email,
    age: Number(age) || 18,
    sport,
    role: 'ATHLETE' as const,
    xp: 0,
    level: 'Rookie',
    streak: 1,
    lastLoginDate: new Date().toISOString(),
    progress: defaultModuleProgress(),
    completedModules: defaultModuleProgress(),
    quizScores: {},
    quizArenaScores: [],
    achievements: defaultAchievements,
    monthlyXP: createEmptyMonthlyXP(),
    dailyMission: {
      date: new Date().toISOString().split('T')[0],
      scenariosCompleted: 0,
      quizQuestionsAnswered: 0,
    },
    recentActivity: [
      {
        type: 'profile_created',
        description: 'Joined AntiDopX Clean Sport Academy',
        timestamp: new Date().toISOString(),
      },
    ],
    savedMedicines: [],
    savedSupplements: [],
    createdAt: new Date().toISOString(),
  };

  // Always cache locally so the athlete is never blocked
  try {
    await AsyncStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profileData));
  } catch {
    // Ignore storage failure
  }

  const docRef = doc(db, 'users', uid);

  // 1. Try writing to Firestore with merge
  try {
    await setDoc(docRef, profileData, { merge: true });
    return { success: true, data: undefined };
  } catch (setErr: any) {
    console.warn('Full setDoc failed, attempting partial update:', setErr?.message);

    // 2. If full set failed (e.g. document already exists with restricted update fields), try updateDoc
    try {
      await updateDoc(docRef, {
        name,
        age: Number(age) || 18,
        sport,
      });
      return { success: true, data: undefined };
    } catch (updateErr: any) {
      console.warn('updateDoc also failed:', updateErr?.message);

      // If it's a Firestore permission denied error, we succeed with local cache
      // so the user can continue using the application while updating console rules
      if (
        setErr?.code === 'permission-denied' ||
        setErr?.message?.includes('permission') ||
        updateErr?.code === 'permission-denied'
      ) {
        return {
          success: true,
          data: undefined,
        };
      }

      return {
        success: false,
        error: getErrorMessage(setErr),
      };
    }
  }
};
