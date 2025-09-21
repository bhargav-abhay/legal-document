// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth service to initialize
    const initializeAuth = async () => {
      setLoading(true);
      try {
        await authService.waitForAuthInit();
        setUser(authService.getCurrentUser());
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = authService.addAuthListener((newUser) => {
      setUser(newUser);
      setLoading(false);
      if (error) setError(null); // Clear any previous errors
    });

    return unsubscribe;
  }, [error]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithGoogle();
      if (!result.success) {
        setError(result.error);
      } else {
        // Track successful login
        // await authService.trackActivity('google_login');
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Google sign-in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!email || !password) {
      const error = 'Email and password are required';
      setError(error);
      return { success: false, error };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithEmail(email, password);
      if (!result.success) {
        setError(result.error);
      } else {
        // Track successful login
        // await authService.trackActivity('email_login');
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Email sign-in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    if (!email || !password) {
      const error = 'Email and password are required';
      setError(error);
      return { success: false, error };
    }

    if (password.length < 6) {
      const error = 'Password must be at least 6 characters';
      setError(error);
      return { success: false, error };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signUpWithEmail(email, password, displayName);
      if (!result.success) {
        setError(result.error);
      } else {
        // Track successful registration
        // await authService.trackActivity('email_signup', {
        //   hasDisplayName: !!displayName
        // });
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Account creation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!email) {
      const error = 'Email is required';
      setError(error);
      return { success: false, error };
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.resetPassword(email);
      if (!result.success) {
        setError(result.error);
      } else {
        // Track password reset request
        // await authService.trackActivity('password_reset_requested', {
        //   email
        // });
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Track logout before signing out
      // if (user) {
      //   await authService.trackActivity('logout');
      // }
      
      const result = await authService.signOut();
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Sign out failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      const error = 'No user signed in';
      setError(error);
      return { success: false, error };
    }

    setError(null);
    
    try {
      const result = await authService.updateUserProfile(updates);
      if (!result.success) {
        setError(result.error);
      } else {
        // Track profile update
        // await authService.trackActivity('profile_updated', {
        //   updatedFields: Object.keys(updates)
        // });
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      const error = 'No user signed in';
      setError(error);
      return { success: false, error };
    }

    setError(null);
    
    try {
      // Track account deletion before deleting
      // await authService.trackActivity('account_deletion_requested');
      
      const result = await authService.deleteAccount();
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Account deletion failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);


  return {
    // User state
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,

    // Authentication methods
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,

    // Profile management
    updateProfile,
    deleteAccount,

    // Utility methods
    clearError,
  };
};



