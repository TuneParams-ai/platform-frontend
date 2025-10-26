
// Helper functions for course data - now using Firestore instead of static data
import { getAllCourses, getCourseBatches } from '../services/courseManagementService';

// Cache for courses to avoid repeated Firestore calls
let coursesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all courses from Firestore with caching
 */
export const getCachedCourses = async () => {
    const now = Date.now();

    // Return cached data if still valid
    if (coursesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        return coursesCache;
    }

    // Fetch fresh data from Firestore
    try {
        const courses = await getAllCourses();
        coursesCache = courses;
        cacheTimestamp = now;
        return courses;
    } catch (error) {
        console.error('Error fetching courses:', error);
        // Return cached data even if expired, or empty array
        return coursesCache || [];
    }
};

/**
 * Clear the courses cache (useful after updates)
 */
export const clearCoursesCache = () => {
    coursesCache = null;
    cacheTimestamp = null;
};

/**
 * Get courses data (for backwards compatibility)
 * Note: This is async now, so components using it need to be updated
 */
export const coursesData = await getCachedCourses().catch(() => []);

/**
 * Find course by ID
 * @param {string} courseId - Course ID to find
 * @returns {Promise<Object|null>} Course object or null
 */
export const findCourseById = async (courseId) => {
    const courses = await getCachedCourses();
    return courses.find(course => course.id === courseId) || null;
};

/**
 * Check if course is coming soon
 * @param {Object} course - Course object
 * @returns {boolean} True if coming soon
 */
export const isComingSoon = (course) => {
    return course?.comingSoon === true;
};

/**
 * Get categories from all courses
 * @returns {Promise<Array<string>>} Unique categories
 */
export const getCategories = async () => {
    const courses = await getCachedCourses();
    const categories = [...new Set(courses.map(course => course.category))];
    return categories.filter(Boolean); // Remove null/undefined
};

/**
 * Get next available batch for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Object|null>} Next available batch or null
 */
export const getNextAvailableBatch = async (courseId) => {
    try {
        const batches = await getCourseBatches(courseId);

        if (!batches || batches.length === 0) {
            return null;
        }

        // Find the first active or upcoming batch
        const availableBatch = batches.find(
            batch => batch.status === 'active' || batch.status === 'upcoming'
        );

        return availableBatch || batches[batches.length - 1]; // Return latest if no active/upcoming
    } catch (error) {
        console.error('Error getting next available batch:', error);
        return null;
    }
};

/**
 * Get batch by batch number
 * @param {string} courseId - Course ID
 * @param {number} batchNumber - Batch number
 * @returns {Promise<Object|null>} Batch object or null
 */
export const getBatchByNumber = async (courseId, batchNumber) => {
    try {
        const batches = await getCourseBatches(courseId);
        return batches.find(batch => batch.batchNumber === batchNumber) || null;
    } catch (error) {
        console.error('Error getting batch by number:', error);
        return null;
    }
};

/**
 * Get batch display name
 * @param {Object} batch - Batch object
 * @returns {string} Display name
 */
export const getBatchDisplayName = (batch) => {
    if (!batch) return 'Unknown Batch';
    return `Batch ${batch.batchNumber}: ${batch.batchName || ''}`;
};

/**
 * Get batch short name
 * @param {Object} batch - Batch object
 * @returns {string} Short name
 */
export const getBatchShortName = (batch) => {
    if (!batch) return 'N/A';
    return batch.batchName || `Batch ${batch.batchNumber}`;
};

/**
 * Get user's enrolled batches for a course
 * @param {string} courseId - Course ID
 * @param {Object} enrollmentData - User's enrollment data
 * @returns {Array<Object>} Array of batch objects
 */
export const getUserEnrolledBatches = (courseId, enrollmentData) => {
    if (!enrollmentData || !enrollmentData[courseId]) {
        return [];
    }

    const enrollment = enrollmentData[courseId];
    return enrollment.batches || [];
};

/**
 * Get batch status color class
 * @param {string} status - Batch status
 * @returns {string} CSS class name
 */
export const getBatchStatusColor = (status) => {
    const statusColors = {
        'upcoming': 'status-upcoming',
        'active': 'status-active',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return statusColors[status] || 'status-default';
};

/**
 * Get batch status text
 * @param {string} status - Batch status
 * @returns {string} Human-readable status
 */
export const getBatchStatusText = (status) => {
    const statusText = {
        'upcoming': 'Upcoming',
        'active': 'Active',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusText[status] || status;
};

/**
 * Format batch date range
 * @param {Object} batch - Batch object
 * @returns {string} Formatted date range
 */
export const formatBatchDateRange = (batch) => {
    if (!batch || !batch.startDate) return 'Dates TBD';

    const start = new Date(batch.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    if (!batch.endDate) return start;

    const end = new Date(batch.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return `${start} - ${end}`;
};

/**
 * Get upcoming batches for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array<Object>>} Array of upcoming batches
 */
export const getUpcomingBatches = async (courseId) => {
    try {
        const batches = await getCourseBatches(courseId);
        return batches.filter(batch => batch.status === 'upcoming');
    } catch (error) {
        console.error('Error getting upcoming batches:', error);
        return [];
    }
};

/**
 * Get active batches for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array<Object>>} Array of active batches
 */
export const getActiveBatches = async (courseId) => {
    try {
        const batches = await getCourseBatches(courseId);
        return batches.filter(batch => batch.status === 'active');
    } catch (error) {
        console.error('Error getting active batches:', error);
        return [];
    }
};

/**
 * Get current batch (first active batch or latest batch)
 * @param {string} courseId - Course ID
 * @returns {Promise<Object|null>} Current batch or null
 */
export const getCurrentBatch = async (courseId) => {
    try {
        const batches = await getCourseBatches(courseId);

        // First try to find active batch
        const activeBatch = batches.find(batch => batch.status === 'active');
        if (activeBatch) return activeBatch;

        // Otherwise return most recent batch
        return batches[batches.length - 1] || null;
    } catch (error) {
        console.error('Error getting current batch:', error);
        return null;
    }
};

/**
 * Get available access links for a batch
 * @param {Object} batch - Batch object
 * @returns {Array<Object>} Array of available access links
 */
export const getAvailableAccessLinks = (batch) => {
    if (!batch || !batch.classLinks) return [];

    const links = [];

    if (batch.classLinks.zoom) {
        links.push({
            type: 'zoom',
            label: 'Zoom Meeting',
            url: batch.classLinks.zoom,
            icon: '📹'
        });
    }

    if (batch.classLinks.discord) {
        links.push({
            type: 'discord',
            label: 'Discord Server',
            url: batch.classLinks.discord,
            icon: '💬'
        });
    }

    return links;
};

/**
 * Check if batch has schedule
 * @param {Object} batch - Batch object
 * @returns {boolean} True if batch has schedule
 */
export const hasSchedule = (batch) => {
    return batch && batch.schedule && batch.schedule.length > 0;
};

/**
 * Check if batch has access links
 * @param {Object} batch - Batch object
 * @returns {boolean} True if batch has access links
 */
export const hasAccessLinks = (batch) => {
    if (!batch || !batch.classLinks) return false;
    return !!(batch.classLinks.zoom || batch.classLinks.discord);
};

// Export for backwards compatibility
const courseHelpers = {
    coursesData,
    getCachedCourses,
    clearCoursesCache,
    findCourseById,
    isComingSoon,
    getCategories,
    getNextAvailableBatch,
    getBatchByNumber,
    getBatchDisplayName,
    getBatchShortName,
    getUserEnrolledBatches,
    getBatchStatusColor,
    getBatchStatusText,
    formatBatchDateRange,
    getUpcomingBatches,
    getActiveBatches,
    getCurrentBatch,
    getAvailableAccessLinks,
    hasSchedule,
    hasAccessLinks
};

export default courseHelpers;
