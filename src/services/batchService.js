// src/services/batchService.js
// Service for handling batch-specific operations
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { findCourseById, getBatchByNumber, getNextAvailableBatch } from '../data/coursesData';

/**
 * Get enrollment count for a specific batch
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @returns {Promise<Object>} Batch enrollment count and success status
 */
export const getBatchEnrollmentCount = async (courseId, batchNumber) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('courseId', '==', courseId),
            where('batchNumber', '==', batchNumber),
            where('status', '==', 'enrolled')
        );

        const querySnapshot = await getDocs(enrollmentsQuery);
        const enrollmentCount = querySnapshot.size;

        return { success: true, count: enrollmentCount };

    } catch (error) {
        console.error('Error getting batch enrollment count:', error);
        return { success: false, error: error.message, count: 0 };
    }
};

/**
 * Get all enrollments for a specific batch
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @returns {Promise<Object>} List of batch enrollments
 */
export const getBatchEnrollments = async (courseId, batchNumber) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('courseId', '==', courseId),
            where('batchNumber', '==', batchNumber)
        );

        const querySnapshot = await getDocs(enrollmentsQuery);
        const enrollments = [];

        querySnapshot.forEach((doc) => {
            enrollments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, enrollments };

    } catch (error) {
        console.error('Error getting batch enrollments:', error);
        return { success: false, error: error.message, enrollments: [] };
    }
};

/**
 * Get enrollment statistics for all batches of a course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Batch statistics
 */
export const getCourseAllBatchStats = async (courseId) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const course = findCourseById(courseId);
        if (!course || !course.batches) {
            return { success: false, error: 'Course not found or no batches defined' };
        }

        const batchStats = {};

        // Get enrollment counts for each batch
        for (const batch of course.batches) {
            const result = await getBatchEnrollmentCount(courseId, batch.batchNumber);
            batchStats[batch.batchNumber] = {
                ...batch,
                enrollmentCount: result.success ? result.count : 0,
                error: result.success ? null : result.error
            };
        }

        return { success: true, batchStats };

    } catch (error) {
        console.error('Error getting course batch stats:', error);
        return { success: false, error: error.message, batchStats: {} };
    }
};

/**
 * Get user's enrollment in a specific batch
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @returns {Promise<Object>} User's batch enrollment
 */
export const getUserBatchEnrollment = async (userId, courseId, batchNumber) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const enrollmentId = `${userId}_${courseId}_batch${batchNumber}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        const enrollmentDoc = await getDoc(enrollmentRef);

        if (enrollmentDoc.exists()) {
            return {
                success: true,
                enrollment: {
                    id: enrollmentDoc.id,
                    ...enrollmentDoc.data()
                }
            };
        } else {
            return { success: false, enrollment: null };
        }

    } catch (error) {
        console.error('Error getting user batch enrollment:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all user enrollments for a specific course (all batches)
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} All user enrollments for the course
 */
export const getUserCourseEnrollments = async (userId, courseId) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('userId', '==', userId),
            where('courseId', '==', courseId)
        );

        const querySnapshot = await getDocs(enrollmentsQuery);
        const enrollments = [];

        querySnapshot.forEach((doc) => {
            enrollments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by batch number
        enrollments.sort((a, b) => (a.batchNumber || 0) - (b.batchNumber || 0));

        return { success: true, enrollments };

    } catch (error) {
        console.error('Error getting user course enrollments:', error);
        return { success: false, error: error.message, enrollments: [] };
    }
};

/**
 * Check if a batch is available for enrollment
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @returns {Promise<Object>} Availability status
 */
export const isBatchAvailableForEnrollment = async (courseId, batchNumber) => {
    try {
        const course = findCourseById(courseId);
        if (!course) {
            return { success: false, available: false, error: 'Course not found' };
        }

        const batch = getBatchByNumber(course, batchNumber);
        if (!batch) {
            return { success: false, available: false, error: 'Batch not found' };
        }

        // Check if batch is upcoming or active
        if (batch.status !== 'upcoming' && batch.status !== 'active') {
            return { success: true, available: false, reason: 'Batch is not active or upcoming' };
        }

        // Check enrollment count
        const enrollmentResult = await getBatchEnrollmentCount(courseId, batchNumber);
        if (!enrollmentResult.success) {
            return { success: false, available: false, error: enrollmentResult.error };
        }

        const isNotFull = enrollmentResult.count < batch.maxCapacity;

        return {
            success: true,
            available: isNotFull,
            batch: {
                ...batch,
                enrollmentCount: enrollmentResult.count
            },
            reason: isNotFull ? 'Available' : 'Batch is full'
        };

    } catch (error) {
        console.error('Error checking batch availability:', error);
        return { success: false, available: false, error: error.message };
    }
};

/**
 * Get the next available batch for enrollment in a course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Next available batch with enrollment count
 */
export const getNextAvailableBatchWithCount = async (courseId) => {
    try {
        const course = findCourseById(courseId);
        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        const nextBatch = getNextAvailableBatch(course);
        if (!nextBatch) {
            return { success: true, batch: null, reason: 'No available batches' };
        }

        // Get current enrollment count for this batch
        const enrollmentResult = await getBatchEnrollmentCount(courseId, nextBatch.batchNumber);

        const batchWithCount = {
            ...nextBatch,
            enrollmentCount: enrollmentResult.success ? enrollmentResult.count : 0
        };

        return { success: true, batch: batchWithCount };

    } catch (error) {
        console.error('Error getting next available batch:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get batch class links for enrolled users
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @returns {Promise<Object>} Batch class links
 */
export const getBatchClassLinks = async (userId, courseId, batchNumber) => {
    try {
        // First, verify user is enrolled in this batch
        const enrollmentResult = await getUserBatchEnrollment(userId, courseId, batchNumber);
        if (!enrollmentResult.success || !enrollmentResult.enrollment) {
            return { success: false, error: 'User not enrolled in this batch' };
        }

        const course = findCourseById(courseId);
        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        const batch = getBatchByNumber(course, batchNumber);
        if (!batch) {
            return { success: false, error: 'Batch not found' };
        }

        return {
            success: true,
            classLinks: batch.classLinks || {},
            batch: batch,
            enrollment: enrollmentResult.enrollment
        };

    } catch (error) {
        console.error('Error getting batch class links:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update batch status (admin function)
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @param {string} newStatus - New status (upcoming, active, completed)
 * @returns {Promise<Object>} Update result
 */
export const updateBatchStatus = async (courseId, batchNumber, newStatus) => {
    try {
        // Note: This would require updating the course data
        // For now, this is a placeholder for future implementation
        // In a production system, batch information might be stored in Firestore

        console.log(`Batch status update requested: Course ${courseId}, Batch ${batchNumber}, Status: ${newStatus}`);

        return {
            success: false,
            error: 'Batch status updates not yet implemented. Batch data is currently static in coursesData.js'
        };

    } catch (error) {
        console.error('Error updating batch status:', error);
        return { success: false, error: error.message };
    }
};

const batchService = {
    getBatchEnrollmentCount,
    getBatchEnrollments,
    getCourseAllBatchStats,
    getUserBatchEnrollment,
    getUserCourseEnrollments,
    isBatchAvailableForEnrollment,
    getNextAvailableBatchWithCount,
    getBatchClassLinks,
    updateBatchStatus
};

export default batchService;
