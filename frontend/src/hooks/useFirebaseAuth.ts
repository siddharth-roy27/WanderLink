import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { completeLoginFlow, logout, getBackendToken } from '@/lib/api-auth';

/**
 * React hook for Firebase Authentication
 * Provides user state, loading state, and auth methods
 */
export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendToken, setBackendToken] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // User is signed in, get backend token
        try {
          const token = await firebaseUser.getIdToken();
          const backendResponse = await completeLoginFlow(token);
          
          if (backendResponse.token) {
            setBackendToken(backendResponse.token);
          }
        } catch (error) {
          console.error('Error syncing with backend:', error);
        }
      } else {
        // User is signed out
        setBackendToken(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  /**
   * Login to backend with Firebase token
   */
  const syncWithBackend = async (firebaseToken: string) => {
    try {
      const response = await completeLoginFlow(firebaseToken);
      if (response.token) {
        setBackendToken(response.token);
      }
      return response;
    } catch (error) {
      console.error('Error syncing with backend:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setBackendToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    backendToken,
    isAuthenticated: !!user,
    syncWithBackend,
    logout: handleLogout,
  };
};
