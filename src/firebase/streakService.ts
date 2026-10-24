import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from './config';
import { getLocalProfile, updateLocalProfileData } from './userService';

export const updateDailyStreak = async (
  uid: string
): Promise<{ success: boolean; streak: number; error?: string }> => {
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
      console.warn('Firestore getDoc failed in updateDailyStreak:', e);
    }

    if (!foundInFirestore) {
      const local = await getLocalProfile(uid);
      if (local) {
        userData = local;
      }
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const lastLogin = userData.lastLoginDate?.split('T')[0];

    let streak = userData.streak || 1;

    if (lastLogin === todayString) {
      return {
        success: true,
        streak,
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (lastLogin === yesterdayString) {
      streak += 1;
    } else if (lastLogin) {
      streak = 1;
    }

    // Save locally
    await updateLocalProfileData(uid, {
      streak,
      lastLoginDate: today.toISOString(),
    });

    // Try sync to Firestore
    try {
      await updateDoc(userRef, {
        streak,
        lastLoginDate: today.toISOString(),
      });
    } catch (firestoreError: any) {
      console.warn('Firestore updateDoc skipped in updateDailyStreak:', firestoreError?.message);
    }

    return {
      success: true,
      streak,
    };
  } catch (error: any) {
    console.warn('Handling updateDailyStreak fallback:', error);
    return {
      success: true,
      streak: 1,
    };
  }
};