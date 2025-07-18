// src/config/firebase.js
// Firebase configuration using ONLY environment variables
// No sensitive data is exposed in this file - all keys come from .env.local
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration - using only environment variables
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY?.trim(),
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: process.env.REACT_APP_FIREBASE_APP_ID?.trim()
};

// Debug: Simple logging to confirm environment variables are loaded
console.log('Firebase Environment Variables Loaded:', {
    allFirebaseVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_FIREBASE')).length,
    usingSource: process.env.REACT_APP_FIREBASE_API_KEY ? 'Environment Variables (.env.local)' : 'NOT LOADED - Check .env.local file'
});

// Check if all required environment variables are present
const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required Firebase environment variables:', missingVars);
    console.error('Please check your .env.local file contains all required Firebase variables');
}

// Initialize Firebase
let app;
let auth;
let db;
let googleProvider;
let isFirebaseConfigured = false;

try {
    // Check if all required config values are present
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

    if (missingKeys.length > 0) {
        throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
    }

    // Initialize Firebase with environment variables
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    // Configure Google provider
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });

    isFirebaseConfigured = true;
    console.log('✅ Firebase initialized successfully using environment variables');
    console.log('Auth domain configured:', firebaseConfig.authDomain);
    console.log('Firestore database connected:', firebaseConfig.projectId);

} catch (error) {
    console.error('Firebase initialization error:', error);
    // Create mock objects to prevent app crashes
    auth = null;
    db = null;
    googleProvider = null;
    isFirebaseConfigured = false;
}

export { auth, db, googleProvider, isFirebaseConfigured };
export default app;
