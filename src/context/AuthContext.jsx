import React, { createContext, useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../config/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

export const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({ success: false, error: 'Firebase not configured' }),
  signInWithEmail: async () => ({ success: false, error: 'Firebase not configured' }),
  registerWithEmail: async () => ({ success: false, error: 'Firebase not configured' }),
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

  // Email/Password Sign-In function
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const userData = {
        uid: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        role: 'student'
      };

      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Email sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  // Email/Password Registration function
  const registerWithEmail = async (email, password, firstName, lastName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update profile with name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      const userData = {
        uid: user.uid,
        name: `${firstName} ${lastName}`,
        email: user.email,
        photoURL: user.photoURL,
        role: 'student'
      };

      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
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
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: 'student'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;