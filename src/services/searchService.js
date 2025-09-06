// src/services/searchService.js
// Comprehensive search service for Firebase data
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    startAt,
    endAt
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Universal search function for any collection
 * @param {string} collectionName - Firestore collection name
 * @param {Object} searchOptions - Search configuration
 * @returns {Promise<Object>} Search results
 */
export const searchCollection = async (collectionName, searchOptions = {}) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const {
            searchTerm = '',
            searchFields = [],
            filters = {},
            orderByField = 'createdAt',
            orderDirection = 'desc',
            limitCount = 100,
            exactMatch = false,
            caseSensitive = false
        } = searchOptions;

        // For search queries, get all documents to avoid index issues
        let searchQuery = collection(db, collectionName);

        // If we have a search term, just get all documents and filter client-side
        if (searchTerm && searchTerm.trim()) {
            // Simple query with just limit to avoid composite index requirements
            searchQuery = query(searchQuery, limit(1000)); // Get more for searching
        } else {
            // For non-search queries, we can use filters and ordering
            const constraints = [];

            // Add filters
            Object.entries(filters).forEach(([field, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    constraints.push(where(field, '==', value));
                }
            });

            // Try to add ordering, but catch any errors
            if (orderByField) {
                try {
                    constraints.push(orderBy(orderByField, orderDirection));
                } catch (e) {
                    console.warn(`Ordering by ${orderByField} failed for ${collectionName}, skipping ordering:`, e);
                }
            }

            // Add limit
            constraints.push(limit(limitCount));

            // Apply constraints if we have any
            if (constraints.length > 0) {
                try {
                    searchQuery = query(searchQuery, ...constraints);
                } catch (e) {
                    console.warn(`Query with constraints failed for ${collectionName}, falling back to simple query:`, e);
                    // Fallback to simple collection query
                    searchQuery = query(collection(db, collectionName), limit(limitCount));
                }
            }
        }

        const querySnapshot = await getDocs(searchQuery);
        const allResults = [];

        querySnapshot.forEach((doc) => {
            allResults.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`Got ${allResults.length} documents from ${collectionName}`);
        if (collectionName === 'coupons') {
            console.log('Sample coupon documents:', allResults.slice(0, 3));
        }

        // Client-side text search if searchTerm provided
        let filteredResults = allResults;
        if (searchTerm && searchTerm.trim() && searchFields.length > 0) {
            const normalizedSearchTerm = caseSensitive ?
                searchTerm.trim() :
                searchTerm.trim().toLowerCase();

            console.log(`Filtering for search term: "${normalizedSearchTerm}" in fields:`, searchFields);

            filteredResults = allResults.filter(item => {
                const matches = searchFields.some(field => {
                    const fieldValue = getNestedValue(item, field);
                    if (!fieldValue) return false;

                    const normalizedFieldValue = caseSensitive ?
                        fieldValue.toString() :
                        fieldValue.toString().toLowerCase();

                    const result = exactMatch ?
                        normalizedFieldValue === normalizedSearchTerm :
                        normalizedFieldValue.includes(normalizedSearchTerm);

                    if (collectionName === 'coupons' && field === 'code') {
                        console.log(`Checking coupon code: "${fieldValue}" vs search term: "${normalizedSearchTerm}" = ${result}`);
                    }

                    return result;
                });
                return matches;
            });

            console.log(`Filtered to ${filteredResults.length} results for ${collectionName}`);
        }

        return {
            success: true,
            results: filteredResults,
            totalCount: filteredResults.length,
            hasMore: querySnapshot.docs.length === (searchTerm ? 1000 : limitCount)
        };

    } catch (error) {
        console.error(`Error searching ${collectionName}:`, error);
        return {
            success: false,
            error: error.message,
            results: [],
            totalCount: 0
        };
    }
};

/**
 * Helper function to get nested object values
 * @param {Object} obj - Object to search in
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @returns {any} Value at path or null
 */
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
};

/**
 * Search users by email, name, or display name
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchUsers = async (searchTerm, options = {}) => {
    return searchCollection('users', {
        searchTerm,
        searchFields: ['email', 'displayName', 'firstName', 'lastName'],
        orderByField: 'createdAt',
        limitCount: 50,
        ...options
    });
};

/**
 * Search coupons by code, name, or description
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchCoupons = async (searchTerm, options = {}) => {
    return searchCollection('coupons', {
        searchTerm,
        searchFields: ['code', 'name', 'description', 'targetUserEmail'],
        orderByField: 'createdAt',
        limitCount: 100,
        ...options
    });
};

/**
 * Search emails by recipient, subject, or content
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchEmails = async (searchTerm, options = {}) => {
    return searchCollection('emails_sent', {
        searchTerm,
        searchFields: ['recipientEmail', 'recipientName', 'subject', 'courseTitle', 'paymentId', 'orderId'],
        orderByField: 'sentAt',
        limitCount: 200,
        ...options
    });
};

/**
 * Search forum threads by title or content
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchForumThreads = async (searchTerm, options = {}) => {
    return searchCollection('forum_threads', {
        searchTerm,
        searchFields: ['title', 'content', 'authorName'],
        orderByField: 'createdAt',
        limitCount: 50,
        ...options
    });
};

/**
 * Search enrollments by user or course information
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchEnrollments = async (searchTerm, options = {}) => {
    return searchCollection('enrollments', {
        searchTerm,
        searchFields: ['userEmail', 'userName', 'courseId', 'courseTitle', 'paymentId'],
        orderByField: 'enrolledAt',
        limitCount: 100,
        ...options
    });
};

/**
 * Search payments by user, course, or payment details
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export const searchPayments = async (searchTerm, options = {}) => {
    return searchCollection('payments', {
        searchTerm,
        searchFields: ['userEmail', 'courseId', 'courseTitle', 'paymentId', 'orderId', 'couponCode'],
        orderByField: 'createdAt',
        limitCount: 100,
        ...options
    });
};

/**
 * Firestore prefix search for autocomplete (works for single field)
 * @param {string} collectionName - Collection to search
 * @param {string} field - Field to search in
 * @param {string} prefix - Search prefix
 * @param {number} limitCount - Result limit
 * @returns {Promise<Object>} Search results
 */
export const prefixSearch = async (collectionName, field, prefix, limitCount = 10) => {
    try {
        if (!db || !prefix || !prefix.trim()) {
            return { success: true, results: [] };
        }

        const normalizedPrefix = prefix.trim().toLowerCase();
        const prefixQuery = query(
            collection(db, collectionName),
            orderBy(field),
            startAt(normalizedPrefix),
            endAt(normalizedPrefix + '\uf8ff'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(prefixQuery);
        const results = [];

        querySnapshot.forEach((doc) => {
            results.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            success: true,
            results
        };

    } catch (error) {
        console.error('Error in prefix search:', error);
        return {
            success: false,
            error: error.message,
            results: []
        };
    }
};

/**
 * Advanced search with multiple filters and conditions
 * @param {string} collectionName - Collection to search
 * @param {Object} searchConfig - Advanced search configuration
 * @returns {Promise<Object>} Search results
 */
export const advancedSearch = async (collectionName, searchConfig) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const {
            textSearch = {},
            filters = {},
            dateRange = {},
            sorting = {},
            pagination = {}
        } = searchConfig;

        // Build query constraints
        const constraints = [];

        // Add filters
        Object.entries(filters).forEach(([field, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                if (Array.isArray(value)) {
                    constraints.push(where(field, 'in', value));
                } else {
                    constraints.push(where(field, '==', value));
                }
            }
        });

        // Add date range filters
        if (dateRange.field && (dateRange.start || dateRange.end)) {
            if (dateRange.start) {
                constraints.push(where(dateRange.field, '>=', new Date(dateRange.start)));
            }
            if (dateRange.end) {
                constraints.push(where(dateRange.field, '<=', new Date(dateRange.end)));
            }
        }

        // Add sorting
        const orderField = sorting.field || 'createdAt';
        const orderDirection = sorting.direction || 'desc';
        constraints.push(orderBy(orderField, orderDirection));

        // Add pagination
        const limitCount = pagination.limit || 100;
        constraints.push(limit(limitCount));

        // Execute query
        const searchQuery = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(searchQuery);

        let results = [];
        querySnapshot.forEach((doc) => {
            results.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Apply text search if specified
        if (textSearch.term && textSearch.fields) {
            const normalizedSearchTerm = textSearch.caseSensitive ?
                textSearch.term.trim() :
                textSearch.term.trim().toLowerCase();

            results = results.filter(item => {
                return textSearch.fields.some(field => {
                    const fieldValue = getNestedValue(item, field);
                    if (!fieldValue) return false;

                    const normalizedFieldValue = textSearch.caseSensitive ?
                        fieldValue.toString() :
                        fieldValue.toString().toLowerCase();

                    return textSearch.exactMatch ?
                        normalizedFieldValue === normalizedSearchTerm :
                        normalizedFieldValue.includes(normalizedSearchTerm);
                });
            });
        }

        return {
            success: true,
            results,
            totalCount: results.length,
            hasMore: querySnapshot.docs.length === limitCount
        };

    } catch (error) {
        console.error('Error in advanced search:', error);
        return {
            success: false,
            error: error.message,
            results: [],
            totalCount: 0
        };
    }
};

/**
 * Search across multiple collections
 * @param {string} searchTerm - Search term
 * @param {Array} collections - Collections to search
 * @returns {Promise<Object>} Combined search results
 */
export const globalSearch = async (searchTerm, collections = ['users', 'coupons', 'emails_sent', 'forum_threads', 'enrollments', 'payments', 'coupon_usage', 'course_reviews']) => {
    try {
        const searchPromises = collections.map(async (collectionName) => {
            let searchFields = [];

            switch (collectionName) {
                case 'users':
                    searchFields = ['email', 'displayName', 'firstName', 'lastName'];
                    break;
                case 'coupons':
                    searchFields = ['code', 'name', 'description', 'targetUserEmail'];
                    break;
                case 'emails_sent':
                    searchFields = ['recipientEmail', 'recipientName', 'subject', 'courseTitle'];
                    break;
                case 'forum_threads':
                    searchFields = ['title', 'content', 'authorName'];
                    break;
                case 'enrollments':
                    searchFields = ['userEmail', 'userName', 'courseId', 'courseTitle'];
                    break;
                case 'payments':
                    searchFields = ['userEmail', 'courseId', 'courseTitle', 'paymentId'];
                    break;
                case 'coupon_usage':
                    searchFields = ['couponCode', 'userEmail', 'courseId', 'paymentId'];
                    break;
                case 'course_reviews':
                    searchFields = ['userName', 'userEmail', 'courseId', 'courseTitle', 'comment'];
                    break;
                default:
                    searchFields = ['name', 'title', 'email'];
            }

            console.log(`Searching ${collectionName} for "${searchTerm}" in fields:`, searchFields);

            const result = await searchCollection(collectionName, {
                searchTerm,
                searchFields,
                limitCount: 20
            });

            console.log(`${collectionName} search result:`, result);

            return {
                collection: collectionName,
                ...result
            };
        });

        const results = await Promise.all(searchPromises);

        return {
            success: true,
            results: results.filter(result => result.success),
            errors: results.filter(result => !result.success)
        };

    } catch (error) {
        console.error('Error in global search:', error);
        return {
            success: false,
            error: error.message,
            results: []
        };
    }
};

const searchServiceAPI = {
    searchCollection,
    searchUsers,
    searchCoupons,
    searchEmails,
    searchForumThreads,
    searchEnrollments,
    searchPayments,
    prefixSearch,
    advancedSearch,
    globalSearch
};

export default searchServiceAPI;
