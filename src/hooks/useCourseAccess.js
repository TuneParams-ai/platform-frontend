// src/hooks/useCourseAccess.js
// Custom hook for managing course access and enrollments
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
    checkCourseAccess,
    getUserEnrollments,
    recordPayment,
    enrollUserInCourse,
    updateCourseProgress
} from '../services/paymentService';

export const useCourseAccess = (courseId = null) => {
    const { user } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [enrollment, setEnrollment] = useState(null);
    const [allEnrollments, setAllEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check access for a specific course
    const checkAccess = useCallback(async (targetCourseId) => {
        if (!user || !targetCourseId) {
            setHasAccess(false);
            setEnrollment(null);
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await checkCourseAccess(user.uid, targetCourseId);

            if (result.error) {
                setError(result.error);
                setHasAccess(false);
                setEnrollment(null);
                return false;
            }

            setHasAccess(result.hasAccess);
            setEnrollment(result.enrollment);
            return result.hasAccess;

        } catch (err) {
            setError(err.message);
            setHasAccess(false);
            setEnrollment(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load all user enrollments
    const loadEnrollments = useCallback(async () => {
        if (!user) {
            setAllEnrollments([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await getUserEnrollments(user.uid);

            if (result.success) {
                setAllEnrollments(result.enrollments);
            } else {
                setError(result.error);
                setAllEnrollments([]);
            }

        } catch (err) {
            setError(err.message);
            setAllEnrollments([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Process payment and enroll user
    const processEnrollment = useCallback(async (paymentData) => {
        if (!user) {
            throw new Error('User must be logged in to enroll');
        }

        setLoading(true);
        setError(null);

        try {
            // Record the payment
            const paymentResult = await recordPayment(paymentData, user.uid);

            if (!paymentResult.success) {
                throw new Error(`Payment recording failed: ${paymentResult.error}`);
            }

            // Enroll user in the course
            const enrollmentResult = await enrollUserInCourse(
                user.uid,
                paymentData.courseId,
                paymentData
            );

            if (!enrollmentResult.success) {
                throw new Error(`Enrollment failed: ${enrollmentResult.error}`);
            }

            // Refresh access status
            await checkAccess(paymentData.courseId);
            await loadEnrollments();

            return {
                success: true,
                paymentRecordId: paymentResult.paymentRecordId,
                enrollmentId: enrollmentResult.enrollmentId
            };

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, checkAccess, loadEnrollments]);

    // Update progress for a course
    const updateProgress = useCallback(async (targetCourseId, progress) => {
        if (!user) {
            throw new Error('User must be logged in');
        }

        try {
            const result = await updateCourseProgress(user.uid, targetCourseId, progress);

            if (result.success) {
                // Refresh enrollment data to show updated progress
                await checkAccess(targetCourseId);
                await loadEnrollments();
            }

            return result;

        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [user, checkAccess, loadEnrollments]);

    // Check if user has access to any course
    const hasAnyCourseAccess = useCallback(() => {
        return allEnrollments.length > 0;
    }, [allEnrollments]);

    // Get enrollment for a specific course
    const getEnrollmentForCourse = useCallback((targetCourseId) => {
        return allEnrollments.find(enrollment => enrollment.courseId === targetCourseId);
    }, [allEnrollments]);

    // Auto-check access when courseId prop changes
    useEffect(() => {
        if (courseId) {
            checkAccess(courseId);
        }
    }, [courseId, checkAccess]);

    // Auto-load enrollments when user changes
    useEffect(() => {
        loadEnrollments();
    }, [loadEnrollments]);

    return {
        // Access status
        hasAccess,
        enrollment,
        allEnrollments,

        // Loading and error states
        loading,
        error,

        // Actions
        checkAccess,
        loadEnrollments,
        processEnrollment,
        updateProgress,

        // Utility functions
        hasAnyCourseAccess,
        getEnrollmentForCourse,

        // Clear error
        clearError: () => setError(null)
    };
};
