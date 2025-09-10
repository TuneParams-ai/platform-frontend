// src/services/courseStatsService.js
// Service for calculating dynamic course statistics from Firestore
import {
    collection,
    getDocs,
    query,
    where,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { findCourseById } from '../data/coursesData';

/**
 * Get enrollment count for a specific course
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Optional batch number to get specific batch count
 * @returns {Promise<Object>} Enrollment count and success status
 */
export const getCourseEnrollmentCount = async (courseId, batchNumber = null) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        let enrollmentsQuery;

        if (batchNumber) {
            // Get count for specific batch
            enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('courseId', '==', courseId),
                where('batchNumber', '==', batchNumber),
                where('status', '==', 'enrolled')
            );
        } else {
            // Get count for all batches of the course
            enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('courseId', '==', courseId),
                where('status', '==', 'enrolled')
            );
        }

        const querySnapshot = await getDocs(enrollmentsQuery);
        const enrollmentCount = querySnapshot.size;

        return { success: true, count: enrollmentCount };

    } catch (error) {

        return { success: false, error: error.message, count: 0 };
    }
};

/**
 * Get average rating and review count for a specific course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Rating statistics and success status
 */
export const getCourseRatingStats = async (courseId) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const reviewsQuery = query(
            collection(db, 'course_reviews'),
            where('courseId', '==', courseId)
        );

        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = [];

        querySnapshot.forEach((doc) => {
            const reviewData = doc.data();
            if (reviewData.rating && typeof reviewData.rating === 'number') {
                reviews.push(reviewData.rating);
            }
        });

        const reviewCount = reviews.length;
        let averageRating = 0;

        if (reviewCount > 0) {
            const totalRating = reviews.reduce((sum, rating) => sum + rating, 0);
            averageRating = totalRating / reviewCount;
        }

        return {
            success: true,
            averageRating: parseFloat(averageRating.toFixed(1)),
            reviewCount: reviewCount,
            hasReviews: reviewCount > 0
        };

    } catch (error) {

        return {
            success: false,
            error: error.message,
            averageRating: 0,
            reviewCount: 0,
            hasReviews: false
        };
    }
};

/**
 * Get enrollment counts for all batches of a course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Batch-wise enrollment counts
 */
export const getCourseBatchCounts = async (courseId) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const course = findCourseById(courseId);
        if (!course || !course.batches) {
            return { success: false, error: 'Course not found or no batches defined', batchCounts: {} };
        }

        const batchCounts = {};

        // Get enrollment counts for each batch
        for (const batch of course.batches) {
            const result = await getCourseEnrollmentCount(courseId, batch.batchNumber);
            batchCounts[batch.batchNumber] = {
                batchNumber: batch.batchNumber,
                count: result.success ? result.count : 0,
                maxCapacity: batch.maxCapacity,
                status: batch.status,
                startDate: batch.startDate,
                endDate: batch.endDate,
                error: result.success ? null : result.error
            };
        }

        return { success: true, batchCounts };

    } catch (error) {

        return { success: false, error: error.message, batchCounts: {} };
    }
};

/**
 * Get combined course statistics with batch information
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Combined statistics including batch data
 */
export const getCourseStatsWithBatches = async (courseId) => {
    try {
        const [enrollmentResult, ratingResult, batchResult] = await Promise.all([
            getCourseEnrollmentCount(courseId), // Total enrollment across all batches
            getCourseRatingStats(courseId),
            getCourseBatchCounts(courseId)
        ]);

        return {
            success: true,
            stats: {
                totalEnrollmentCount: enrollmentResult.success ? enrollmentResult.count : 0,
                averageRating: ratingResult.success ? ratingResult.averageRating : 0,
                reviewCount: ratingResult.success ? ratingResult.reviewCount : 0,
                hasReviews: ratingResult.success ? ratingResult.hasReviews : false,
                batchCounts: batchResult.success ? batchResult.batchCounts : {}
            },
            errors: {
                enrollment: enrollmentResult.success ? null : enrollmentResult.error,
                rating: ratingResult.success ? null : ratingResult.error,
                batches: batchResult.success ? null : batchResult.error
            }
        };

    } catch (error) {

        return {
            success: false,
            error: error.message,
            stats: {
                totalEnrollmentCount: 0,
                averageRating: 0,
                reviewCount: 0,
                hasReviews: false,
                batchCounts: {}
            }
        };
    }
};

/**
 * Get combined course statistics (enrollments and ratings)
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Combined statistics
 */
export const getCourseStats = async (courseId) => {
    try {
        const [enrollmentResult, ratingResult] = await Promise.all([
            getCourseEnrollmentCount(courseId),
            getCourseRatingStats(courseId)
        ]);

        return {
            success: true,
            stats: {
                enrollmentCount: enrollmentResult.success ? enrollmentResult.count : 0,
                averageRating: ratingResult.success ? ratingResult.averageRating : 0,
                reviewCount: ratingResult.success ? ratingResult.reviewCount : 0,
                hasReviews: ratingResult.success ? ratingResult.hasReviews : false
            },
            errors: {
                enrollment: enrollmentResult.success ? null : enrollmentResult.error,
                rating: ratingResult.success ? null : ratingResult.error
            }
        };

    } catch (error) {

        return {
            success: false,
            error: error.message,
            stats: {
                enrollmentCount: 0,
                averageRating: 0,
                reviewCount: 0,
                hasReviews: false
            }
        };
    }
};

/**
 * Get statistics for multiple courses
 * @param {Array<string>} courseIds - Array of course identifiers
 * @returns {Promise<Object>} Statistics for all courses
 */
export const getMultipleCourseStats = async (courseIds) => {
    try {
        const statsPromises = courseIds.map(courseId => getCourseStats(courseId));
        const results = await Promise.all(statsPromises);

        const courseStats = {};
        courseIds.forEach((courseId, index) => {
            courseStats[courseId] = results[index].success ? results[index].stats : {
                enrollmentCount: 0,
                averageRating: 0,
                reviewCount: 0,
                hasReviews: false
            };
        });

        return { success: true, courseStats };

    } catch (error) {

        return { success: false, error: error.message, courseStats: {} };
    }
};

/**
 * Subscribe to real-time enrollment count updates for a course
 * @param {string} courseId - Course identifier
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToEnrollmentCount = (courseId, callback) => {
    if (!db) {

        callback({ count: 0, error: 'Firestore not initialized' });
        return () => { };
    }

    try {
        const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('courseId', '==', courseId),
            where('status', '==', 'enrolled')
        );

        return onSnapshot(
            enrollmentsQuery,
            (snapshot) => {
                const count = snapshot.size;
                callback({ count, error: null });
            },
            (error) => {

                callback({ count: 0, error: error.message });
            }
        );
    } catch (error) {

        callback({ count: 0, error: error.message });
        return () => { };
    }
};

/**
 * Subscribe to real-time rating statistics updates for a course
 * @param {string} courseId - Course identifier
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToRatingStats = (courseId, callback) => {
    if (!db) {

        callback({ averageRating: 0, reviewCount: 0, hasReviews: false, error: 'Firestore not initialized' });
        return () => { };
    }

    try {
        const reviewsQuery = query(
            collection(db, 'course_reviews'),
            where('courseId', '==', courseId)
        );

        return onSnapshot(
            reviewsQuery,
            (snapshot) => {
                const reviews = [];
                snapshot.forEach((doc) => {
                    const reviewData = doc.data();
                    if (reviewData.rating && typeof reviewData.rating === 'number') {
                        reviews.push(reviewData.rating);
                    }
                });

                const reviewCount = reviews.length;
                let averageRating = 0;

                if (reviewCount > 0) {
                    const totalRating = reviews.reduce((sum, rating) => sum + rating, 0);
                    averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
                }

                callback({
                    averageRating,
                    reviewCount,
                    hasReviews: reviewCount > 0,
                    error: null
                });
            },
            (error) => {

                callback({
                    averageRating: 0,
                    reviewCount: 0,
                    hasReviews: false,
                    error: error.message
                });
            }
        );
    } catch (error) {

        callback({
            averageRating: 0,
            reviewCount: 0,
            hasReviews: false,
            error: error.message
        });
        return () => { };
    }
};

/**
 * Subscribe to combined course statistics (enrollments and ratings)
 * @param {string} courseId - Course identifier
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCourseStats = (courseId, callback) => {
    let enrollmentUnsubscribe = () => { };
    let ratingUnsubscribe = () => { };

    let enrollmentData = { count: 0, error: null };
    let ratingData = { averageRating: 0, reviewCount: 0, hasReviews: false, error: null };

    const updateCallback = () => {
        callback({
            enrollmentCount: enrollmentData.count,
            averageRating: ratingData.averageRating,
            reviewCount: ratingData.reviewCount,
            hasReviews: ratingData.hasReviews,
            errors: {
                enrollment: enrollmentData.error,
                rating: ratingData.error
            }
        });
    };

    enrollmentUnsubscribe = subscribeToEnrollmentCount(courseId, (data) => {
        enrollmentData = data;
        updateCallback();
    });

    ratingUnsubscribe = subscribeToRatingStats(courseId, (data) => {
        ratingData = data;
        updateCallback();
    });

    // Return combined unsubscribe function
    return () => {
        enrollmentUnsubscribe();
        ratingUnsubscribe();
    };
};
