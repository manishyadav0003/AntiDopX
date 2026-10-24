import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCQB5tA5BkvAoFmyzntXnSu6Pi9LRO5ERA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "antidopx.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "antidopx",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "antidopx.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "431858822021",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:431858822021:web:6b353132c8fa5e443332ec"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = (() => {
  try {
    const authModule = FirebaseAuth as unknown as {
      initializeAuth?: typeof FirebaseAuth.initializeAuth;
      getReactNativePersistence?: (storage: typeof AsyncStorage) => any;
      getAuth: typeof FirebaseAuth.getAuth;
    };
    if (typeof authModule.initializeAuth === 'function' && typeof authModule.getReactNativePersistence === 'function') {
      return authModule.initializeAuth(app, {
        persistence: authModule.getReactNativePersistence(AsyncStorage),
      });
    }
    return FirebaseAuth.getAuth(app);
  } catch {
    return FirebaseAuth.getAuth(app);
  }
})();

export const db = getFirestore(app);

export default app;
