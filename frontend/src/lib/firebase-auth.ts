import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Store confirmation result for OTP verification
let confirmationResult: ConfirmationResult | null = null;

/**
 * Setup reCAPTCHA verifier for OTP authentication
 */
export const setupRecaptcha = (): void => {
  if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
      }
    );
  }
};

/**
 * Send OTP to phone number
 * @param phone - Phone number with country code (e.g., +1234567890)
 * @returns ConfirmationResult for verification
 */
export const sendOTP = async (phone: string): Promise<ConfirmationResult> => {
  setupRecaptcha();
  const appVerifier = window.recaptchaVerifier;

  try {
    confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP code
 * @param code - OTP code received by user
 * @returns User credential
 */
export const verifyOTP = async (code: string) => {
  if (!confirmationResult) {
    throw new Error('No confirmation result. Please send OTP first.');
  }

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    // Get Firebase ID token to send to backend
    const token = await user.getIdToken();
    
    return { user, token };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Sign in with Google
 * @returns User credential and token
 */
export const signInWithGoogle = async () => {
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Get Firebase ID token to send to backend
    const token = await user.getIdToken();
    
    return { user, token };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Get current user's Firebase ID token
 * @param forceRefresh - Force refresh the token
 * @returns ID token string
 */
export const getCurrentUserToken = async (forceRefresh = false): Promise<string | null> => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
