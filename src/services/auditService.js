// src/services/auditService.js
// Service for tracking user actions and maintaining audit trails
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Log user actions for audit trail
 * @param {Object} auditData - Audit information
 * @returns {Promise<Object>} Success/error response
 */
export const logAuditEvent = async (auditData) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const auditLog = {
            // Event information
            action: auditData.action, // 'create', 'update', 'delete', 'view', 'login', 'payment', etc.
            resource: auditData.resource, // 'user', 'enrollment', 'payment', 'coupon', etc.
            resourceId: auditData.resourceId || null,

            // User information
            userId: auditData.userId,
            userEmail: auditData.userEmail || null,
            userRole: auditData.userRole || 'student',

            // Request details
            ipAddress: auditData.ipAddress || null,
            userAgent: auditData.userAgent || navigator.userAgent,

            // Data changes (for update operations)
            previousData: auditData.previousData || null,
            newData: auditData.newData || null,

            // Additional context
            description: auditData.description || '',
            metadata: auditData.metadata || {},

            // Timestamp
            timestamp: serverTimestamp(),
            createdAt: new Date()
        };

        const auditRef = await addDoc(collection(db, 'audit_logs'), auditLog);

        return {
            success: true,
            auditId: auditRef.id
        };

    } catch (error) {
        console.error('Failed to log audit event:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get audit logs with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Audit logs
 */
export const getAuditLogs = async (filters = {}) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        let auditQuery = collection(db, 'audit_logs');
        const conditions = [];

        // Apply filters
        if (filters.userId) {
            conditions.push(where('userId', '==', filters.userId));
        }
        if (filters.action) {
            conditions.push(where('action', '==', filters.action));
        }
        if (filters.resource) {
            conditions.push(where('resource', '==', filters.resource));
        }
        if (filters.startDate) {
            conditions.push(where('createdAt', '>=', filters.startDate));
        }
        if (filters.endDate) {
            conditions.push(where('createdAt', '<=', filters.endDate));
        }

        // Build query with conditions
        if (conditions.length > 0) {
            auditQuery = query(auditQuery, ...conditions);
        }

        // Add ordering and limit
        auditQuery = query(
            auditQuery,
            orderBy('createdAt', 'desc'),
            limit(filters.limit || 100)
        );

        const snapshot = await getDocs(auditQuery);
        const logs = [];

        snapshot.forEach(doc => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            success: true,
            logs
        };

    } catch (error) {
        console.error('Failed to get audit logs:', error);
        return {
            success: false,
            error: error.message,
            logs: []
        };
    }
};

/**
 * Audit helper functions for common actions
 */
export const auditHelpers = {
    // User authentication
    loginSuccess: (userId, userEmail) => logAuditEvent({
        action: 'login_success',
        resource: 'auth',
        userId,
        userEmail,
        description: 'User logged in successfully'
    }),

    loginFailure: (email, reason) => logAuditEvent({
        action: 'login_failure',
        resource: 'auth',
        userEmail: email,
        description: `Login failed: ${reason}`
    }),

    // Course enrollment
    courseEnrollment: (userId, courseId, paymentData) => logAuditEvent({
        action: 'create',
        resource: 'enrollment',
        resourceId: `${userId}_${courseId}`,
        userId,
        newData: {
            courseId,
            paymentAmount: paymentData.amount,
            paymentId: paymentData.paymentId
        },
        description: `User enrolled in course ${courseId}`
    }),

    // Payment processing
    paymentSuccess: (userId, paymentData) => logAuditEvent({
        action: 'create',
        resource: 'payment',
        resourceId: paymentData.paymentId,
        userId,
        newData: paymentData,
        description: `Payment processed successfully: $${paymentData.amount}`
    }),

    paymentFailure: (userId, error, amount) => logAuditEvent({
        action: 'payment_failure',
        resource: 'payment',
        userId,
        description: `Payment failed: ${error}`,
        metadata: { attemptedAmount: amount }
    }),

    // Coupon usage
    couponUsed: (userId, couponData) => logAuditEvent({
        action: 'update',
        resource: 'coupon',
        resourceId: couponData.couponId,
        userId,
        newData: {
            couponCode: couponData.couponCode,
            discountAmount: couponData.discountAmount,
            courseId: couponData.courseId
        },
        description: `Coupon ${couponData.couponCode} used`
    }),

    // Admin actions
    adminAction: (adminId, action, resource, resourceId, changes) => logAuditEvent({
        action,
        resource,
        resourceId,
        userId: adminId,
        userRole: 'admin',
        previousData: changes.before,
        newData: changes.after,
        description: `Admin performed ${action} on ${resource}`
    }),

    // Review management
    reviewCreated: (userId, reviewData) => logAuditEvent({
        action: 'create',
        resource: 'review',
        resourceId: reviewData.id,
        userId,
        newData: {
            courseId: reviewData.courseId,
            rating: reviewData.rating,
            comment: reviewData.comment
        },
        description: `User posted review for course ${reviewData.courseId}`
    }),

    reviewDeleted: (adminId, reviewData) => logAuditEvent({
        action: 'delete',
        resource: 'review',
        resourceId: reviewData.id,
        userId: adminId,
        userRole: 'admin',
        previousData: reviewData,
        description: `Admin deleted review by ${reviewData.userName}`
    })
};

/**
 * Export audit logs to JSON for backup
 * @param {Object} filters - Filter options
 * @returns {Promise<string>} JSON string of audit logs
 */
export const exportAuditLogs = async (filters = {}) => {
    try {
        const result = await getAuditLogs({ ...filters, limit: 10000 });

        if (!result.success) {
            throw new Error(result.error);
        }

        const exportData = {
            exportedAt: new Date().toISOString(),
            filters,
            totalRecords: result.logs.length,
            logs: result.logs
        };

        return JSON.stringify(exportData, null, 2);

    } catch (error) {
        console.error('Failed to export audit logs:', error);
        throw error;
    }
};

/**
 * Get audit statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Audit statistics
 */
export const getAuditStats = async (filters = {}) => {
    try {
        const result = await getAuditLogs({ ...filters, limit: 10000 });

        if (!result.success) {
            throw new Error(result.error);
        }

        const stats = {
            totalEvents: result.logs.length,
            actionCounts: {},
            resourceCounts: {},
            userCounts: {},
            dailyActivity: {}
        };

        result.logs.forEach(log => {
            // Count by action
            stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;

            // Count by resource
            stats.resourceCounts[log.resource] = (stats.resourceCounts[log.resource] || 0) + 1;

            // Count by user
            if (log.userId) {
                stats.userCounts[log.userId] = (stats.userCounts[log.userId] || 0) + 1;
            }

            // Daily activity
            if (log.createdAt) {
                const date = new Date(log.createdAt).toISOString().split('T')[0];
                stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
            }
        });

        return {
            success: true,
            stats
        };

    } catch (error) {
        console.error('Failed to get audit stats:', error);
        return {
            success: false,
            error: error.message
        };
    }
};