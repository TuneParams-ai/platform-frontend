// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCn55V2y3cXp4Ln0NWjlauU8rgZgMgwDyc",
    authDomain: "tuneparams.firebaseapp.com",
    projectId: "tuneparams",
    storageBucket: "tuneparams.firebasestorage.app",
    messagingSenderId: "995918337622",
    appId: "1:995918337622:web:505babbabe198e3f0d0df7"
};

// Debug: Log the config to see what values are being used
console.log('Firebase Config:', firebaseConfig);

// Initialize Firebase
let app;
let auth;
let googleProvider;
let isFirebaseConfigured = false;

try {
    // Initialize Firebase with the hard-coded config
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Configure Google provider
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });

    isFirebaseConfigured = true;
    console.log('Firebase initialized successfully');

} catch (error) {
    console.error('Firebase initialization error:', error);
    // Create mock objects to prevent app crashes
    auth = null;
    googleProvider = null;
    isFirebaseConfigured = false;
}

export { auth, googleProvider, isFirebaseConfigured };
export default app;
