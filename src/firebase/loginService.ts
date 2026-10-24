import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config';

export const loginUser = async (
  email: string,
  password: string
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};