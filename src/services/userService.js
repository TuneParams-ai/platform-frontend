// src/services/userService.js
// Service for managing user profiles and data
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Creates or updates a user profile in Firestore
 * @param {Object} user - Firebase user object
 * @returns {Promise<Object>} Success/error response
 */
export const createOrUpdateUserProfile = async (user) => {
    try {
        if (!user || !user.uid) {
            throw new Error('Invalid user object provided');
        }

        const userRef = doc(db, 'users', user.uid);

        // Check if user already exists
        const existingUser = await getDoc(userRef);

        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.name || '',
            photoURL: user.photoURL || '',
            emailVerified: user.emailVerified || false,
            lastLoginAt: serverTimestamp(),
            // Don't overwrite existing data if user already exists
            ...(existingUser.exists() ? {} : {
                createdAt: serverTimestamp(),
                role: 'student' // Default role
            })
        };

        await setDoc(userRef, userData, { merge: true });

        return {
            success: true,
            message: 'User profile updated successfully',
            userData
        };

    } catch (error) {
        console.error('Error creating/updating user profile:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Gets a user profile by user ID
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} User profile data or null
 */
export const getUserProfile = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return {
                success: true,
                userData: {
                    id: userDoc.id,
                    ...userDoc.data()
                }
            };
        } else {
            return {
                success: false,
                error: 'User profile not found'
            };
        }

    } catch (error) {
        console.error('Error getting user profile:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Gets all users for admin management
 * @returns {Promise<Array>} Array of user profiles
 */
export const getAllUsers = async () => {
    try {
        const usersQuery = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc')
        );

        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            users
        };

    } catch (error) {
        console.error('Error getting all users:', error);
        return {
            success: false,
            error: error.message,
            users: []
        };
    }
};

/**
 * Searches users by email
 * @param {string} email - Email to search for
 * @returns {Promise<Object>} User profile or null
 */
export const getUserByEmail = async (email) => {
    try {
        if (!email) {
            throw new Error('Email is required');
        }

        const usersQuery = query(
            collection(db, 'users'),
            where('email', '==', email)
        );

        const usersSnapshot = await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            return {
                success: true,
                userData: {
                    id: userDoc.id,
                    ...userDoc.data()
                }
            };
        } else {
            return {
                success: false,
                error: 'User not found'
            };
        }

    } catch (error) {
        console.error('Error searching user by email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Updates user profile information
 * @param {string} userId - Firebase user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Success/error response
 */
export const updateUserProfile = async (userId, updates) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const userRef = doc(db, 'users', userId);
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        await setDoc(userRef, updateData, { merge: true });

        return {
            success: true,
            message: 'User profile updated successfully'
        };

    } catch (error) {
        console.error('Error updating user profile:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Updates user role in users collection (for syncing with user_roles collection)
 * @param {string} userId - Firebase user ID
 * @param {string} role - User role to sync
 * @returns {Promise<Object>} Success/error response
 */
export const syncUserRole = async (userId, role) => {
    try {
        if (!userId || !role) {
            throw new Error('User ID and role are required');
        }

        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            role: role,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return {
            success: true,
            message: 'User role synced successfully'
        };

    } catch (error) {
        console.error('Error syncing user role:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
