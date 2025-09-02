// src/hooks/useCourseStats.js
// Custom hook for managing course statistics
import { useState, useEffect } from 'react';
import {
    getCourseStats,
    getMultipleCourseStats,
    subscribeToCourseStats
} from '../services/courseStatsService';

/**
 * Hook to get and subscribe to course statistics for a single course
 * @param {string} courseId - Course identifier
 * @param {boolean} realTime - Whether to use real-time updates (default: false)
 * @returns {Object} Course statistics and loading state
 */
export const useCourseStats = (courseId, realTime = false) => {
    const [stats, setStats] = useState({
        enrollmentCount: 0,
        averageRating: 0,
        reviewCount: 0,
        hasReviews: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!courseId) {
            setLoading(false);
            return;
        }

        if (realTime) {
            // Set up real-time subscription
            const unsubscribe = subscribeToCourseStats(courseId, (newStats) => {
                setStats({
                    enrollmentCount: newStats.enrollmentCount,
                    averageRating: newStats.averageRating,
                    reviewCount: newStats.reviewCount,
                    hasReviews: newStats.hasReviews
                });

                // Set error if any of the subscriptions failed
                if (newStats.errors?.enrollment || newStats.errors?.rating) {
                    setError(newStats.errors.enrollment || newStats.errors.rating);
                } else {
                    setError(null);
                }

                setLoading(false);
            });

            return unsubscribe;
        } else {
            // One-time fetch
            const fetchStats = async () => {
                setLoading(true);
                try {
                    const result = await getCourseStats(courseId);

                    if (result.success) {
                        setStats(result.stats);
                        setError(null);
                    } else {
                        setError(result.error);
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchStats();
        }
    }, [courseId, realTime]);

    return { stats, loading, error };
};

/**
 * Hook to get statistics for multiple courses
 * @param {Array<string>} courseIds - Array of course identifiers
 * @returns {Object} Course statistics mapping and loading state
 */
export const useMultipleCourseStats = (courseIds) => {
    const [courseStats, setCourseStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!courseIds || courseIds.length === 0) {
            setLoading(false);
            return;
        }

        const fetchMultipleStats = async () => {
            setLoading(true);
            try {
                const result = await getMultipleCourseStats(courseIds);

                if (result.success) {
                    setCourseStats(result.courseStats);
                    setError(null);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMultipleStats();
    }, [courseIds]);

    return { courseStats, loading, error };
};

/**
 * Helper function to get display-friendly rating
 * @param {number} rating - Raw rating value
 * @param {boolean} hasReviews - Whether there are any reviews
 * @returns {string|number} Display rating
 */
export const getDisplayRating = (rating, hasReviews) => {
    if (!hasReviews || rating === 0) {
        return 'No ratings yet';
    }
    return rating;
};

/**
 * Helper function to format enrollment count
 * @param {number} count - Enrollment count
 * @returns {string} Formatted count
 */
export const formatEnrollmentCount = (count) => {
    if (count === 0) {
        return 'Be the first to enroll!';
    } else if (count === 1) {
        return '1 student enrolled';
    } else {
        return `${count} students enrolled`;
    }
};
