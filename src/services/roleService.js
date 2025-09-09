// src/services/roleService.js
// Service for managing user roles and permissions
import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * User roles and their permissions
 */
export const USER_ROLES = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student'
};

export const PERMISSIONS = {
    VIEW_ADMIN_PANEL: 'view_admin_panel',
    MANAGE_USERS: 'manage_users',
    VIEW_PAYMENTS: 'view_payments',
    MANAGE_COURSES: 'manage_courses',
    VIEW_ANALYTICS: 'view_analytics'
};

export const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        PERMISSIONS.VIEW_ADMIN_PANEL,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_PAYMENTS,
        PERMISSIONS.MANAGE_COURSES,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [USER_ROLES.INSTRUCTOR]: [
        PERMISSIONS.MANAGE_COURSES,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [USER_ROLES.STUDENT]: []
};

/**
 * Creates or updates a user's role in Firestore
 * @param {string} userId - Firebase user ID
 * @param {string} role - User role (admin, instructor, student)
 * @param {string} assignedBy - ID of user who assigned the role
 * @returns {Promise<Object>} Success/error response
 */
export const assignUserRole = async (userId, role, assignedBy) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        if (!Object.values(USER_ROLES).includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }

        const userRoleData = {
            userId: userId,
            role: role,
            permissions: ROLE_PERMISSIONS[role] || [],
            assignedBy: assignedBy,
            assignedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true
        };

        // Use userId as document ID to ensure one role per user
        const roleRef = doc(db, 'user_roles', userId);
        await setDoc(roleRef, userRoleData);

        // Also update the role in the users collection to keep them in sync
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            role: role,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return { success: true, role: userRoleData };

    } catch (error) {
        console.error('Error assigning user role:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gets a user's role and permissions
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} User role data or null
 */
export const getUserRole = async (userId) => {
    try {
        if (!db) {
            return { role: USER_ROLES.STUDENT, permissions: [] };
        }

        const roleRef = doc(db, 'user_roles', userId);
        const roleDoc = await getDoc(roleRef);

        if (roleDoc.exists()) {
            const userData = roleDoc.data();
            return userData;
        } else {
            // Default to student role if no role assigned
            return {
                role: USER_ROLES.STUDENT,
                permissions: ROLE_PERMISSIONS[USER_ROLES.STUDENT],
                isActive: true
            };
        }

    } catch (error) {
        console.error('Error getting user role:', error);
        return { role: USER_ROLES.STUDENT, permissions: [] };
    }
};/**
 * Checks if a user has a specific permission
 * @param {string} userId - Firebase user ID
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} Whether user has permission
 */
export const userHasPermission = async (userId, permission) => {
    try {
        const userRole = await getUserRole(userId);
        return userRole.permissions?.includes(permission) || false;
    } catch (error) {
        console.error('Error checking user permission:', error);
        return false;
    }
};

/**
 * Checks if a user has admin access
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} Whether user is admin
 */
export const isUserAdmin = async (userId) => {
    try {
        const userRole = await getUserRole(userId);
        const isAdmin = userRole.role === USER_ROLES.ADMIN && userRole.isActive;
        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};/**
 * Logs role assignment actions for audit trail
 * @param {string} action - Action performed
 * @param {string} targetUserId - User who was affected
 * @param {string} performedBy - User who performed the action
 * @param {Object} details - Additional details
 */
export const logRoleAction = async (action, targetUserId, performedBy, details = {}) => {
    try {
        const logEntry = {
            action: action,
            targetUserId: targetUserId,
            performedBy: performedBy,
            details: details,
            timestamp: serverTimestamp(),
            ipAddress: null // Could be added later
        };

        await addDoc(collection(db, 'role_audit_log'), logEntry);
    } catch (error) {
        console.error('Error logging role action:', error);
    }
};
