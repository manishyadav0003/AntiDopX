import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './config';

export const registerUser = async (
  email: string,
  password: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
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

export const sendForgotPasswordEmail = async (email: string) => {
  if (!email || !email.trim()) {
    return {
      success: false,
      error: 'Please enter your registered email address first.',
    };
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return {
      success: true,
      message: `Password reset email sent to ${email.trim()}. Please check your inbox and follow the link to create a new password.`,
    };
  } catch (error: any) {
    let friendlyMessage = error.message;

    if (error.code === 'auth/user-not-found') {
      friendlyMessage = 'No athlete account found registered with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/missing-email') {
      friendlyMessage = 'Please enter your email address.';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyMessage = 'Too many requests. Please wait a few moments before trying again.';
    }

    return {
      success: false,
      error: friendlyMessage,
    };
  }
};