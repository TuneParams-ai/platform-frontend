// src/services/emailTrackingService.js
// Service for tracking emails sent through the platform
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Records an email sent to a user in Firestore
 * @param {Object} emailData - Email details
 * @returns {Promise<Object>} Success/error response
 */
export const recordEmailSent = async (emailData) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const {
            userId,
            recipientEmail,
            recipientName,
            emailType,
            subject,
            templateId,
            courseId,
            courseTitle,
            paymentId,
            orderId,
            amount,
            enrollmentId,
            emailServiceResponse,
            success,
            error,
            rawTextContent
        } = emailData;

        const emailRecord = {
            // User identification
            userId: userId || null,
            recipientEmail: recipientEmail,
            recipientName: recipientName || '',

            // Email classification
            emailType: emailType, // 'enrollment_confirmation', 'course_reminder', etc.
            subject: subject,
            templateId: templateId || null,

            // Related data
            courseId: courseId || null,
            courseTitle: courseTitle || '',
            paymentId: paymentId || null,
            orderId: orderId || null,
            amount: amount || null,
            enrollmentId: enrollmentId || null,

            // Email service details
            emailServiceProvider: 'emailjs',
            emailServiceResponse: emailServiceResponse || null,

            // Status
            status: success ? 'sent' : 'failed',
            errorMessage: error || null,

            // Raw email content for auditing and debugging
            rawTextContent: rawTextContent || null,

            // Timestamps
            sentAt: serverTimestamp(),
            createdAt: serverTimestamp(),

            // Metadata for analytics
            metadata: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                origin: window.location.origin
            }
        };

        // Store email record
        const emailRef = await addDoc(collection(db, 'emails_sent'), emailRecord);

        console.log('Email record saved with ID:', emailRef.id);
        return { success: true, emailRecordId: emailRef.id };

    } catch (error) {
        console.error('Error recording email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gets all emails sent to a specific user
 * @param {string} userId - Firebase user ID
 * @param {number} limitCount - Number of emails to retrieve (default: 50)
 * @returns {Promise<Object>} Success/error response with emails
 */
export const getUserEmails = async (userId, limitCount = 50) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const emailsQuery = query(
            collection(db, 'emails_sent'),
            where('userId', '==', userId),
            orderBy('sentAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(emailsQuery);
        const emails = [];

        querySnapshot.forEach((doc) => {
            emails.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, emails };

    } catch (error) {
        console.error('Error getting user emails:', error);
        return { success: false, error: error.message, emails: [] };
    }
};

/**
 * Gets emails by recipient email address
 * @param {string} email - Email address
 * @param {number} limitCount - Number of emails to retrieve (default: 50)
 * @returns {Promise<Object>} Success/error response with emails
 */
export const getEmailsByRecipient = async (email, limitCount = 50) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const emailsQuery = query(
            collection(db, 'emails_sent'),
            where('recipientEmail', '==', email),
            orderBy('sentAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(emailsQuery);
        const emails = [];

        querySnapshot.forEach((doc) => {
            emails.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, emails };

    } catch (error) {
        console.error('Error getting emails by recipient:', error);
        return { success: false, error: error.message, emails: [] };
    }
};

/**
 * Search emails across multiple fields (recipient email, name, course title, payment ID, etc.)
 * @param {string} searchTerm - Search term
 * @param {number} limitCount - Number of emails to retrieve (default: 100)
 * @returns {Promise<Object>} Success/error response with emails
 */
export const searchEmails = async (searchTerm, limitCount = 100) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        if (!searchTerm || !searchTerm.trim()) {
            return { success: false, error: 'Search term is required', emails: [] };
        }

        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        // Get all emails and filter client-side since Firestore doesn't support 
        // full-text search across multiple fields
        const emailsQuery = query(
            collection(db, 'emails_sent'),
            orderBy('sentAt', 'desc'),
            limit(1000) // Get a reasonable number to search through
        );

        const querySnapshot = await getDocs(emailsQuery);
        const allEmails = [];

        querySnapshot.forEach((doc) => {
            allEmails.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Client-side filtering across multiple fields
        const filteredEmails = allEmails.filter(email => {
            const searchableFields = [
                email.recipientEmail,
                email.recipientName,
                email.courseTitle,
                email.paymentId,
                email.orderId,
                email.subject,
                email.emailType
            ];

            return searchableFields.some(field =>
                field && field.toLowerCase().includes(normalizedSearchTerm)
            );
        });

        // Limit results
        const limitedResults = filteredEmails.slice(0, limitCount);

        return { success: true, emails: limitedResults };

    } catch (error) {
        console.error('Error searching emails:', error);
        return { success: false, error: error.message, emails: [] };
    }
};

/**
 * Gets emails by course ID
 * @param {string} courseId - Course identifier
 * @param {number} limitCount - Number of emails to retrieve (default: 100)
 * @returns {Promise<Object>} Success/error response with emails
 */
export const getEmailsByCourse = async (courseId, limitCount = 100) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const emailsQuery = query(
            collection(db, 'emails_sent'),
            where('courseId', '==', courseId),
            orderBy('sentAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(emailsQuery);
        const emails = [];

        querySnapshot.forEach((doc) => {
            emails.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, emails };

    } catch (error) {
        console.error('Error getting emails by course:', error);
        return { success: false, error: error.message, emails: [] };
    }
};

/**
 * Gets emails by type (e.g., 'enrollment_confirmation')
 * @param {string} emailType - Type of email
 * @param {number} limitCount - Number of emails to retrieve (default: 100)
 * @returns {Promise<Object>} Success/error response with emails
 */
export const getEmailsByType = async (emailType, limitCount = 100) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const emailsQuery = query(
            collection(db, 'emails_sent'),
            where('emailType', '==', emailType),
            orderBy('sentAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(emailsQuery);
        const emails = [];

        querySnapshot.forEach((doc) => {
            emails.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, emails };

    } catch (error) {
        console.error('Error getting emails by type:', error);
        return { success: false, error: error.message, emails: [] };
    }
};

/**
 * Gets email statistics
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Email statistics
 */
export const getEmailStatistics = async (filters = {}) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        // Base query
        let emailsQuery = collection(db, 'emails_sent');

        // Apply filters if provided
        const constraints = [];

        if (filters.courseId) {
            constraints.push(where('courseId', '==', filters.courseId));
        }

        if (filters.emailType) {
            constraints.push(where('emailType', '==', filters.emailType));
        }

        if (filters.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (constraints.length > 0) {
            emailsQuery = query(emailsQuery, ...constraints);
        }

        const querySnapshot = await getDocs(emailsQuery);

        let totalEmails = 0;
        let sentSuccessfully = 0;
        let failed = 0;
        const emailTypes = {};
        const courses = {};

        querySnapshot.forEach((doc) => {
            const emailData = doc.data();
            totalEmails++;

            if (emailData.status === 'sent') {
                sentSuccessfully++;
            } else if (emailData.status === 'failed') {
                failed++;
            }

            // Count by email type
            const type = emailData.emailType || 'unknown';
            emailTypes[type] = (emailTypes[type] || 0) + 1;

            // Count by course
            if (emailData.courseId && emailData.courseTitle) {
                const courseKey = `${emailData.courseId}_${emailData.courseTitle}`;
                courses[courseKey] = (courses[courseKey] || 0) + 1;
            }
        });

        return {
            success: true,
            statistics: {
                totalEmails,
                sentSuccessfully,
                failed,
                successRate: totalEmails > 0 ? (sentSuccessfully / totalEmails * 100).toFixed(2) : 0,
                emailTypes,
                courses
            }
        };

    } catch (error) {
        console.error('Error getting email statistics:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Records email tracking for enrollment confirmation specifically
 * @param {Object} enrollmentData - Enrollment and email data
 * @param {Object} emailResult - Result from email service
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success/error response
 */
export const recordEnrollmentEmail = async (enrollmentData, emailResult, userId) => {
    const emailTrackingData = {
        userId: userId,
        recipientEmail: enrollmentData.userEmail,
        recipientName: enrollmentData.userName,
        emailType: 'enrollment_confirmation',
        subject: `🎉 Welcome to ${enrollmentData.courseTitle}! Your AI learning journey starts now`,
        templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        courseId: enrollmentData.courseId,
        courseTitle: enrollmentData.courseTitle,
        paymentId: enrollmentData.paymentId,
        orderId: enrollmentData.orderId,
        amount: parseFloat(enrollmentData.amount),
        enrollmentId: enrollmentData.enrollmentId,
        emailServiceResponse: emailResult.messageId,
        success: emailResult.success,
        error: emailResult.error,
        rawTextContent: emailResult.rawTextContent
    };

    return await recordEmailSent(emailTrackingData);
};

/**
 * Get all emails with optional filters and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Success/error response with emails
 */
export const getAllEmails = async (options = {}) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const {
            limitCount = 100,
            orderByField = 'sentAt',
            orderDirection = 'desc',
            filters = {}
        } = options;

        // Build query constraints
        const constraints = [orderBy(orderByField, orderDirection)];

        // Add filters
        if (filters.status) {
            constraints.push(where('status', '==', filters.status));
        }
        if (filters.emailType) {
            constraints.push(where('emailType', '==', filters.emailType));
        }
        if (filters.courseId) {
            constraints.push(where('courseId', '==', filters.courseId));
        }
        if (filters.recipientEmail) {
            constraints.push(where('recipientEmail', '==', filters.recipientEmail));
        }

        // Add limit
        constraints.push(limit(limitCount));

        const emailsQuery = query(
            collection(db, 'emails_sent'),
            ...constraints
        );

        const querySnapshot = await getDocs(emailsQuery);
        const emails = [];

        querySnapshot.forEach((doc) => {
            emails.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, emails };

    } catch (error) {
        console.error('Error getting all emails:', error);
        return { success: false, error: error.message, emails: [] };
    }
};
