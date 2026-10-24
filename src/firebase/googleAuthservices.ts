import Constants from 'expo-constants';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from './config';
import { updateDailyStreak } from './streakService';
import { defaultModuleProgress, createEmptyMonthlyXP } from '../types/userProfile';
import { defaultAchievements } from './achievementService';
import { saveLocalProfile } from './userService';

export function getGoogleWebClientId(): string | null {
  const extraId = Constants.expoConfig?.extra?.webClientId;
  const envId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const candidate = envId || extraId;
  if (!candidate || candidate.includes('YOUR_WEB_CLIENT_ID')) {
    return null;
  }
  return candidate;
}

export function isGoogleAuthConfigured(): boolean {
  return getGoogleWebClientId() !== null;
}

async function ensureProfile(user: User) {
  const profileData = {
    uid: user.uid,
    name: user.displayName || 'Google Athlete',
    email: user.email || '',
    sport: 'Clean Sport Athlete',
    age: 18,
    role: 'ATHLETE' as const,
    xp: 100,
    level: 'Competitor',
    streak: 1,
    createdAt: new Date().toISOString(),
    progress: defaultModuleProgress(),
    completedModules: defaultModuleProgress(),
    quizScores: {},
    quizArenaScores: [],
    achievements: {
      ...defaultAchievements,
      firstModule: true,
    },
    monthlyXP: createEmptyMonthlyXP(),
    savedMedicines: [],
    savedSupplements: [],
  };

  try {
    await saveLocalProfile(profileData as any);
  } catch {}

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, profileData);
    }

    await updateDailyStreak(user.uid);
  } catch (err) {
    console.warn('Failed to ensure remote user profile:', err);
  }
}

export async function signInWithGoogleCredential(idToken: string): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    await ensureProfile(userCredential.user);

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in with Google.',
    };
  }
}

/**
 * Development fallback: signs in or creates a dedicated Google testing account
 * when OAuth Client IDs are still pending in Google Cloud Console.
 */
export async function signInWithDevGoogleAccount(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  const demoEmail = 'athlete.google.test@antidopx.org';
  const demoPassword = 'TestPassword123!';

  try {
    // Try signing in
    const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    await ensureProfile(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (signInErr: any) {
    if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
      try {
        // Create demo account
        const created = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
        await ensureProfile(created.user);
        return { success: true, user: created.user };
      } catch (createErr: any) {
        return { success: false, error: createErr.message };
      }
    }
    return { success: false, error: signInErr.message };
  }
}
