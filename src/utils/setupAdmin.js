// src/utils/setupAdmin.js
// Utility script to quickly set up admin users
import { assignUserRole, USER_ROLES } from '../services/roleService';

/**
 * Quick function to make a user admin
 * Call this in your browser console or from a component
 */
export const makeUserAdmin = async (userId, assignedByUserId = 'system') => {
    try {
        const result = await assignUserRole(userId, USER_ROLES.ADMIN, assignedByUserId);
        return result.success;
    } catch (error) {
        return false;
    }
};

/**
 * Setup script to run in browser console
 * Replace 'your-user-id' with your actual Firebase user ID
 */
export const setupMyAdminRole = async () => {
    // You can get your user ID from Firebase Auth
    // or from the browser console: firebase.auth().currentUser.uid
    const myUserId = 'your-user-id-here'; // Replace with your actual user ID

    return await makeUserAdmin(myUserId, 'initial-setup');
};

// Export for console use
window.setupAdmin = {
    makeUserAdmin,
    setupMyAdminRole
};
