import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Send Firebase token to backend for authentication
 * @param firebaseToken - Firebase ID token
 * @returns Backend auth response
 */
export const firebaseLogin = async (firebaseToken: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/firebase-login`,
      {},
      {
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error logging in with Firebase:', error);
    throw error;
  }
};

/**
 * Verify backend authentication and get user data
 * @param backendToken - Backend JWT token
 * @returns User data
 */
export const verifyBackendAuth = async (backendToken: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${backendToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error verifying backend auth:', error);
    throw error;
  }
};

/**
 * Complete login flow: Firebase Auth → Backend Verification
 * @param firebaseToken - Firebase ID token
 * @returns Complete auth data
 */
export const completeLoginFlow = async (firebaseToken: string) => {
  try {
    // Step 1: Send Firebase token to backend
    const backendResponse = await firebaseLogin(firebaseToken);
    
    // Step 2: Store backend token if provided
    if (backendResponse.token) {
      localStorage.setItem('backendToken', backendResponse.token);
    }
    
    return backendResponse;
  } catch (error) {
    console.error('Error in complete login flow:', error);
    throw error;
  }
};

/**
 * Logout from both Firebase and backend
 */
export const logout = async () => {
  try {
    // Clear backend token
    localStorage.removeItem('backendToken');
    
    // Sign out from Firebase
    const { signOut } = await import('@/lib/firebase-auth');
    await signOut();
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

/**
 * Get stored backend token
 * @returns Backend token or null
 */
export const getBackendToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('backendToken');
  }
  return null;
};
