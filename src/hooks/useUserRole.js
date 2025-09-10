// src/hooks/useUserRole.js
// Custom hook for managing user roles and permissions
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
    getUserRole,
    userHasPermission,
    USER_ROLES,
} from '../services/roleService';

export const useUserRole = () => {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserRole = async () => {
            if (!user) {
                setUserRole(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const roleData = await getUserRole(user.uid);
                setUserRole(roleData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadUserRole();
    }, [user]);

    // Helper functions
    const hasPermission = async (permission) => {
        if (!user) return false;
        return await userHasPermission(user.uid, permission);
    };

    const hasRole = (role) => {
        return userRole?.role === role;
    };

    return {
        userRole,
        loading,
        error,
        hasPermission,
        hasRole,
        // Convenience checks
        isAdminUser: userRole?.role === USER_ROLES.ADMIN,
        isInstructorUser: userRole?.role === USER_ROLES.INSTRUCTOR,
        isStudentUser: userRole?.role === USER_ROLES.STUDENT,
        // Treat admins as instructors for material management
        isInstructor: userRole?.role === USER_ROLES.INSTRUCTOR || userRole?.role === USER_ROLES.ADMIN,
        isAdmin: userRole?.role === USER_ROLES.ADMIN,
        permissions: userRole?.permissions || []
    };
};
