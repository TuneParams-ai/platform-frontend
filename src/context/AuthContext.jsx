import React, { createContext, useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../config/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  applyActionCode
} from "firebase/auth";

export const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({ success: false, error: 'Firebase not configured' }),
  signInWithEmail: async () => ({ success: false, error: 'Firebase not configured' }),
  registerWithEmail: async () => ({ success: false, error: 'Firebase not configured' }),
  sendVerificationEmail: async () => ({ success: false, error: 'Firebase not configured' }),
  verifyEmail: async () => ({ success: false, error: 'Firebase not configured' }),
  logout: async () => ({ success: false, error: 'Firebase not configured' })
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In function
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase not configured. Please check your environment variables.' };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Store user info in localStorage
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'student' // Default role, can be customized later
      };

      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  // Email/Password Sign-In function with email verification check
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth); // Sign out the user
        return {
          success: false,
          error: 'Please verify your email before signing in. Check your inbox for the verification link.',
          requiresVerification: true
        };
      }

      const userData = {
        uid: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: 'student'
      };

      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Email sign-in error:', error);

      let errorMessage = 'Sign-in failed';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Sign-in failed. Please try again.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Email/Password Registration function with email verification
  const registerWithEmail = async (email, password, firstName, lastName) => {
    console.log('Starting registration process for:', email);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('User created successfully:', user.uid);

      // Update profile with name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      console.log('Profile updated with name:', `${firstName} ${lastName}`);

      // Send email verification
      console.log('Sending email verification...');
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login?emailVerified=true`,
        handleCodeInApp: false
      });
      console.log('Email verification sent successfully to:', user.email);

      // Sign out the user after registration so they can't access the app until verified
      await signOut(auth);
      console.log('User signed out after registration');

      // Don't store user in localStorage until email is verified
      // Just return success with verification message
      return {
        success: true,
        requiresVerification: true,
        message: 'Registration successful! Please check your email and click the verification link before signing in.',
        user: {
          uid: user.uid,
          name: `${firstName} ${lastName}`,
          email: user.email,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific registration errors
      let errorMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Send verification email to current user
  const sendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'No user is currently signed in.' };
      }

      if (auth.currentUser.emailVerified) {
        return { success: false, error: 'Email is already verified.' };
      }

      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/login?emailVerified=true`,
        handleCodeInApp: false
      });

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      };
    } catch (error) {
      console.error('Send verification email error:', error);
      return { success: false, error: error.message || 'Failed to send verification email.' };
    }
  };

  // Verify email with action code (for handling email verification links)
  const verifyEmail = async (actionCode) => {
    try {
      console.log('Verifying email with action code...');
      await applyActionCode(auth, actionCode);
      console.log('Action code applied successfully');

      // Note: We don't need to reload or set user here since the user 
      // should sign in after verification. Just return success.
      return {
        success: true,
        message: 'Email verified successfully! You can now sign in.'
      };
    } catch (error) {
      console.error('Email verification error:', error);

      let errorMessage = 'Email verification failed';
      switch (error.code) {
        case 'auth/expired-action-code':
          errorMessage = 'The verification link has expired. Please request a new one.';
          break;
        case 'auth/invalid-action-code':
          errorMessage = 'The verification link is invalid. Please request a new one.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        default:
          errorMessage = error.message || 'Email verification failed.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Only set user if email is verified, except for Google sign-in
        if (firebaseUser.emailVerified || firebaseUser.providerData[0]?.providerId === 'google.com') {
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            role: 'student'
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // If email is not verified, don't set user data
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        // Check if user data exists in localStorage (for page refreshes)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
    sendVerificationEmail,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;