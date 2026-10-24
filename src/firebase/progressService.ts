import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import type { ModuleKey } from '../learning/modules';
import type { ServiceResponse } from '../types/serviceResponse';
import { db } from './config';
import { getLocalProfile, updateLocalProfileData } from './userService';

export const completeModule = async (
  uid: string,
  moduleName: ModuleKey,
  quizScore?: number
): Promise<
  ServiceResponse<{
    progress: Record<ModuleKey, boolean>;
    completedModules: Partial<Record<ModuleKey, boolean>>;
    quizScores: Partial<Record<ModuleKey, number>>;
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
      console.warn('Firestore getDoc failed in completeModule, checking local cache:', e);
    }

    if (!foundInFirestore) {
      const local = await getLocalProfile(uid);
      if (local) {
        userData = local;
      }
    }

    const progress = {
      ...(userData.progress || {}),
      [moduleName]: true,
    };
    const completedModules = {
      ...(userData.completedModules || {}),
      [moduleName]: true,
    };
    const quizScores = {
      ...(userData.quizScores || {}),
    };

    if (quizScore !== undefined) {
      quizScores[moduleName] = quizScore;
    }

    const recentActivity = [
      {
        type: 'module' as const,
        description: `Completed ${moduleName}`,
        timestamp: new Date().toISOString(),
      },
      ...(userData.recentActivity || []),
    ].slice(0, 5);

    // Always update local cache first
    await updateLocalProfileData(uid, {
      progress,
      completedModules,
      quizScores,
      recentActivity,
    });

    // Attempt to sync with Firestore
    try {
      await updateDoc(userRef, {
        progress,
        completedModules,
        quizScores,
        recentActivity,
      });
    } catch (firestoreError: any) {
      console.warn('Firestore updateDoc skipped due to remote rules/offline:', firestoreError?.message);
    }

    return {
      success: true,
      data: {
        progress,
        completedModules,
        quizScores,
      },
    };
  } catch (error: unknown) {
    console.warn('Handling completeModule fallback:', error);
    return {
      success: true,
      data: {
        progress: { [moduleName]: true } as any,
        completedModules: { [moduleName]: true } as any,
        quizScores: quizScore !== undefined ? ({ [moduleName]: quizScore } as any) : {},
      },
    };
  }
};
