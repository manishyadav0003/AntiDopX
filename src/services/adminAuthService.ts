import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export interface AdminAuthCheckResult {
  isAuthorized: boolean;
  adminUid: string | null;
  adminEmail: string | null;
  authMethod?: 'CUSTOM_CLAIM' | 'ENV_DESIGNATED_UID' | 'FIRESTORE_AUTHORIZATION_DOC' | 'FIRESTORE_PROFILE';
  error?: string;
}

/**
 * Single designated administrator UID from environment.
 * In production, this is set to the authorized administrator's Firebase UID.
 */
export const getDesignatedAdminUid = (): string => {
  return process.env.EXPO_PUBLIC_ADMIN_UID || '';
};

/**
 * Server-backed verification of administrator authorization.
 * Client UI state is NEVER trusted on its own.
 */
export const verifyAdminAuthorization = async (): Promise<AdminAuthCheckResult> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return {
      isAuthorized: false,
      adminUid: null,
      adminEmail: null,
      error: 'Authentication required. No active session found.',
    };
  }

  try {
    // 1. Check Firebase Auth Custom Claims (most secure server-side claim)
    try {
      const idTokenResult = await currentUser.getIdTokenResult(true);
      if (
        idTokenResult.claims.role === 'ADMIN' ||
        idTokenResult.claims.admin === true
      ) {
        return {
          isAuthorized: true,
          adminUid: currentUser.uid,
          adminEmail: currentUser.email,
          authMethod: 'CUSTOM_CLAIM',
        };
      }
    } catch (tokenErr) {
      console.warn('ID token custom claims inspection failed:', tokenErr);
    }

    // 2. Check designated single admin UID from environment configuration
    const designatedUid = getDesignatedAdminUid();
    if (designatedUid && currentUser.uid === designatedUid) {
      return {
        isAuthorized: true,
        adminUid: currentUser.uid,
        adminEmail: currentUser.email,
        authMethod: 'ENV_DESIGNATED_UID',
      };
    }

    // 3. Check protected Firestore authorization document (/adminConfig/authorization)
    try {
      const authDocRef = doc(db, 'adminConfig', 'authorization');
      const authDocSnap = await getDoc(authDocRef);
      if (authDocSnap.exists()) {
        const data = authDocSnap.data();
        const adminUids: string[] = Array.isArray(data.adminUids) ? data.adminUids : [];
        if (adminUids.includes(currentUser.uid)) {
          return {
            isAuthorized: true,
            adminUid: currentUser.uid,
            adminEmail: currentUser.email,
            authMethod: 'FIRESTORE_AUTHORIZATION_DOC',
          };
        }
      }
    } catch (docErr) {
      console.warn('Admin authorization document lookup failed:', docErr);
    }

    // 4. Check user profile role in Firestore (requires signed-in user)
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'ADMIN') {
          return {
            isAuthorized: true,
            adminUid: currentUser.uid,
            adminEmail: currentUser.email,
            authMethod: 'FIRESTORE_PROFILE',
          };
        }
      }
    } catch (profileErr) {
      console.warn('User profile check failed:', profileErr);
    }

    // Unauthorized
    return {
      isAuthorized: false,
      adminUid: currentUser.uid,
      adminEmail: currentUser.email,
      error: 'Access Denied: Your account is not authorized as an AntiDopX Administrator.',
    };
  } catch (error: any) {
    return {
      isAuthorized: false,
      adminUid: currentUser.uid,
      adminEmail: currentUser.email,
      error: error?.message || 'Failed to verify administrative authorization.',
    };
  }
};
