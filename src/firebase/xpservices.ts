import { doc, getDoc, updateDoc } from 'firebase/firestore';

import type { ServiceResponse } from '../types/serviceResponse';
import {
  createEmptyMonthlyXP,
} from '../types/userProfile';
import { db } from './config';
import { getLocalProfile, updateLocalProfileData } from './userService';
import {
  calculateLevel,
  getCurrentWeek,
  normalizeMonthlyXP,
} from './xpUtils';

export const addXP = async (
  uid: string,
  amount: number
): Promise<
  ServiceResponse<{
    xp: number;
    level: string;
    monthlyXP: ReturnType<typeof createEmptyMonthlyXP>;
  }>
> => {
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
      console.warn('Firestore getDoc failed in addXP, checking local cache:', e);
    }

    if (!foundInFirestore) {
      const local = await getLocalProfile(uid);
      if (local) {
        userData = local;
      }
    }

    const currentXP = Number(userData.xp || 0);
    const newXP = currentXP + amount;
    const newLevel = calculateLevel(newXP);
    const monthlyXP = normalizeMonthlyXP(userData.monthlyXP);
    const currentWeek = getCurrentWeek();

    monthlyXP[currentWeek] = (monthlyXP[currentWeek] || 0) + amount;

    // Always update local cache first
    await updateLocalProfileData(uid, {
      xp: newXP,
      level: newLevel,
      monthlyXP,
    });

    // Attempt to sync with Firestore
    try {
      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        monthlyXP,
      });
    } catch (firestoreError: any) {
      console.warn('Firestore updateDoc skipped in addXP due to remote rules/offline:', firestoreError?.message);
    }

    return {
      success: true,
      data: {
        xp: newXP,
        level: newLevel,
        monthlyXP,
      },
    };
  } catch (error: unknown) {
    console.warn('Handling addXP fallback:', error);
    const fallbackXP = amount;
    return {
      success: true,
      data: {
        xp: fallbackXP,
        level: calculateLevel(fallbackXP),
        monthlyXP: createEmptyMonthlyXP(),
      },
    };
  }
};
