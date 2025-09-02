// src/hooks/useCourseAccess.js
// Custom hook for managing course access and enrollments with batch support
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
    checkCourseAccess,
    getUserEnrollments,
    processCompleteEnrollment,
    updateCourseProgress
} from '../services/paymentService';
import { getUserCourseEnrollments, getBatchClassLinks } from '../services/batchService';

export const useCourseAccess = (courseId = null, batchNumber = null) => {
    const { user } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [enrollment, setEnrollment] = useState(null);
    const [allEnrollments, setAllEnrollments] = useState([]);
    const [courseEnrollments, setCourseEnrollments] = useState([]); // All batches for current course
    const [batchClassLinks, setBatchClassLinks] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check access for a specific course and batch
    const checkAccess = useCallback(async (targetCourseId, targetBatchNumber = null) => {
        if (!user || !targetCourseId) {
            setHasAccess(false);
            setEnrollment(null);
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await checkCourseAccess(user.uid, targetCourseId, targetBatchNumber);

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

    // Load enrollments for specific course (all batches)
    const loadCourseEnrollments = useCallback(async (targetCourseId) => {
        if (!user || !targetCourseId) {
            setCourseEnrollments([]);
            return;
        }

        try {
            const result = await getUserCourseEnrollments(user.uid, targetCourseId);

            if (result.success) {
                setCourseEnrollments(result.enrollments);
            } else {
                setError(result.error);
                setCourseEnrollments([]);
            }

        } catch (err) {
            setError(err.message);
            setCourseEnrollments([]);
        }
    }, [user]);

    // Load batch class links
    const loadBatchClassLinks = useCallback(async (targetCourseId, targetBatchNumber) => {
        if (!user || !targetCourseId || !targetBatchNumber) {
            setBatchClassLinks(null);
            return;
        }

        try {
            const result = await getBatchClassLinks(user.uid, targetCourseId, targetBatchNumber);

            if (result.success) {
                setBatchClassLinks(result.classLinks);
            } else {
                setError(result.error);
                setBatchClassLinks(null);
            }

        } catch (err) {
            setError(err.message);
            setBatchClassLinks(null);
        }
    }, [user]);

    // Process payment and enroll user (batch automatically assigned)
    const processEnrollment = useCallback(async (paymentData) => {
        if (!user) {
            throw new Error('User must be logged in to enroll');
        }

        setLoading(true);
        setError(null);

        try {
            // Use the complete enrollment process that automatically assigns batch
            const result = await processCompleteEnrollment(paymentData, user.uid);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Refresh access status with the assigned batch number
            await checkAccess(paymentData.courseId, result.batchNumber);
            await loadEnrollments();
            await loadCourseEnrollments(paymentData.courseId);

            return result;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, checkAccess, loadEnrollments, loadCourseEnrollments]);

    // Update progress for a course
    const updateProgress = useCallback(async (targetCourseId, progress, targetBatchNumber = null) => {
        if (!user) {
            throw new Error('User must be logged in');
        }

        try {
            const result = await updateCourseProgress(user.uid, targetCourseId, progress, targetBatchNumber);

            if (result.success) {
                // Refresh enrollment data to show updated progress
                await checkAccess(targetCourseId, targetBatchNumber);
                await loadEnrollments();
                await loadCourseEnrollments(targetCourseId);
            }

            return result;

        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [user, checkAccess, loadEnrollments, loadCourseEnrollments]);

    // Check if user has access to any course
    const hasAnyCourseAccess = useCallback(() => {
        return allEnrollments.length > 0;
    }, [allEnrollments]);

    // Get enrollment for a specific course and batch
    const getEnrollmentForCourseBatch = useCallback((targetCourseId, targetBatchNumber = null) => {
        if (targetBatchNumber) {
            return allEnrollments.find(enrollment =>
                enrollment.courseId === targetCourseId &&
                enrollment.batchNumber === targetBatchNumber
            );
        } else {
            // Return the most recent enrollment for the course
            const courseEnrollments = allEnrollments.filter(enrollment =>
                enrollment.courseId === targetCourseId
            );
            return courseEnrollments.sort((a, b) => {
                const dateA = a.enrolledAt?.toDate?.() || new Date(0);
                const dateB = b.enrolledAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            })[0];
        }
    }, [allEnrollments]);

    // Get all enrollments for a specific course
    const getEnrollmentsForCourse = useCallback((targetCourseId) => {
        return allEnrollments.filter(enrollment => enrollment.courseId === targetCourseId);
    }, [allEnrollments]);

    // Check if user has access to any batch of a course
    const hasAccessToAnyCourse = useCallback((targetCourseId) => {
        return allEnrollments.some(enrollment => enrollment.courseId === targetCourseId);
    }, [allEnrollments]);

    // Auto-check access when courseId or batchNumber props change
    useEffect(() => {
        if (courseId) {
            checkAccess(courseId, batchNumber);
            loadCourseEnrollments(courseId);
        }
    }, [courseId, batchNumber, checkAccess, loadCourseEnrollments]);

    // Auto-load batch class links when enrollment is found
    useEffect(() => {
        if (enrollment && enrollment.courseId && enrollment.batchNumber) {
            loadBatchClassLinks(enrollment.courseId, enrollment.batchNumber);
        }
    }, [enrollment, loadBatchClassLinks]);

    // Auto-load enrollments when user changes
    useEffect(() => {
        loadEnrollments();
    }, [loadEnrollments]);

    return {
        // Access status
        hasAccess,
        enrollment,
        allEnrollments,
        courseEnrollments,
        batchClassLinks,

        // Loading and error states
        loading,
        error,

        // Actions
        checkAccess,
        loadEnrollments,
        loadCourseEnrollments,
        loadBatchClassLinks,
        processEnrollment,
        updateProgress,

        // Utility functions
        hasAnyCourseAccess,
        getEnrollmentForCourseBatch,
        getEnrollmentsForCourse,
        hasAccessToAnyCourse,

        // Clear error
        clearError: () => setError(null)
    };
};
