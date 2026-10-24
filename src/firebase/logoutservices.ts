import { signOut } from 'firebase/auth';
import { auth } from './config';

export const logoutUser = async () => {
  try {
    await signOut(auth);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};