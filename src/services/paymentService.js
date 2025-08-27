// src/services/paymentService.js
// Service for handling payment tracking and course enrollment
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserProfile } from './userService';
import { sendEnrollmentConfirmationEmail } from './emailService';
import { recordEnrollmentEmail } from './emailTrackingService';

/**
 * Records a successful payment in Firestore
 * @param {Object} paymentData - Payment details from PayPal
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} Success/error response
 */
export const recordPayment = async (paymentData, userId) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        // Get user profile to store actual user data
        const userProfile = await getUserProfile(userId);
        const userData = userProfile.success ? userProfile.userData : null;

        const payment = {
            // Payment details
            paymentId: paymentData.paymentID,
            orderId: paymentData.orderID,
            payerId: paymentData.payerID,

            // Course details
            courseId: paymentData.courseId,
            courseTitle: paymentData.courseTitle,
            amount: parseFloat(paymentData.amount),

            // User details - use actual user data instead of payer data
            userId: userId,
            userEmail: userData?.email || paymentData.payerEmail, // Prefer user profile email
            userName: userData?.displayName || paymentData.payerName,

            // Keep payer data for reconciliation
            payerEmail: paymentData.payerEmail,
            payerName: paymentData.payerName,

            // Status and metadata
            status: 'completed',
            transactionStatus: paymentData.transactionStatus,
            paymentMethod: 'paypal',

            // Timestamps
            paymentDate: paymentData.timestamp ? new Date(paymentData.timestamp) : new Date(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Store payment record
        const paymentRef = await addDoc(collection(db, 'payments'), payment);

        console.log('Payment recorded with ID:', paymentRef.id);
        return { success: true, paymentRecordId: paymentRef.id };

    } catch (error) {
        console.error('Error recording payment:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enrolls a user in a course after successful payment
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Success/error response
 */
export const enrollUserInCourse = async (userId, courseId, paymentData) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const enrollment = {
            userId: userId,
            courseId: courseId,
            courseTitle: paymentData.courseTitle,

            // Enrollment status
            status: 'enrolled',
            progress: 0,

            // Payment reference
            paymentId: paymentData.paymentID,
            orderId: paymentData.orderID,
            amountPaid: parseFloat(paymentData.amount),

            // Timestamps
            enrolledAt: serverTimestamp(),
            lastAccessed: null,
            completedAt: null,

            // Metadata
            paymentMethod: 'paypal',
            enrollmentSource: 'web_purchase'
        };

        // Use a combination of userId and courseId as document ID to prevent duplicates
        const enrollmentId = `${userId}_${courseId}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);

        await setDoc(enrollmentRef, enrollment);

        console.log('User enrolled in course:', enrollmentId);
        return { success: true, enrollmentId: enrollmentId };

    } catch (error) {
        console.error('Error enrolling user in course:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Checks if a user has access to a specific course
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Access status and enrollment details
 */
export const checkCourseAccess = async (userId, courseId) => {
    try {
        if (!db) {
            return { hasAccess: false, error: 'Firestore not initialized' };
        }

        const enrollmentId = `${userId}_${courseId}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);
        const enrollmentDoc = await getDoc(enrollmentRef);

        if (enrollmentDoc.exists()) {
            const enrollment = enrollmentDoc.data();

            // Update last accessed timestamp
            await updateDoc(enrollmentRef, {
                lastAccessed: serverTimestamp()
            });

            return {
                hasAccess: true,
                enrollment: {
                    ...enrollment,
                    id: enrollmentDoc.id
                }
            };
        } else {
            return { hasAccess: false, enrollment: null };
        }

    } catch (error) {
        console.error('Error checking course access:', error);
        return { hasAccess: false, error: error.message };
    }
};

/**
 * Gets all enrollments for a specific user
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Array>} List of user enrollments
 */
export const getUserEnrollments = async (userId) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('userId', '==', userId)
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
        console.error('Error getting user enrollments:', error);
        return { success: false, error: error.message, enrollments: [] };
    }
};

/**
 * Gets payment history for a user
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Array>} List of user payments
 */
export const getUserPayments = async (userId) => {
    try {
        if (!db) {
            return { success: false, error: 'Firestore not initialized' };
        }

        const paymentsQuery = query(
            collection(db, 'payments'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(paymentsQuery);
        const payments = [];

        querySnapshot.forEach((doc) => {
            payments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, payments };

    } catch (error) {
        console.error('Error getting user payments:', error);
        return { success: false, error: error.message, payments: [] };
    }
};

/**
 * Complete enrollment process with payment recording, course enrollment, and email confirmation
 * @param {Object} paymentData - Payment details from PayPal
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} Complete enrollment result
 */
export const processCompleteEnrollment = async (paymentData, userId) => {
    try {
        console.log('Starting complete enrollment process...', { paymentData, userId });

        // Step 1: Record the payment
        const paymentResult = await recordPayment(paymentData, userId);
        if (!paymentResult.success) {
            throw new Error(`Payment recording failed: ${paymentResult.error}`);
        }

        // Step 2: Enroll user in the course
        const enrollmentResult = await enrollUserInCourse(userId, paymentData.courseId, paymentData);
        if (!enrollmentResult.success) {
            throw new Error(`Enrollment failed: ${enrollmentResult.error}`);
        }

        // Step 3: Get logged-in user profile for email
        const userProfile = await getUserProfile(userId);
        const userData = userProfile.success ? userProfile.userData : null;

        // Step 4: Prepare enrollment data for email
        const enrollmentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const enrollmentEmailData = {
            // Use logged-in user's details instead of payer details
            userName: userData?.displayName || userData?.email?.split('@')[0] || 'Student',
            userEmail: userData?.email || paymentData.payerEmail, // Fallback to payer email if needed
            courseTitle: paymentData.courseTitle,
            courseId: paymentData.courseId,
            amount: paymentData.amount,
            paymentId: paymentData.paymentID,
            orderId: paymentData.orderID,
            enrollmentId: enrollmentResult.enrollmentId,
            enrollmentDate: enrollmentDate,
            // Add payment method details
            paymentMethod: 'PayPal',
            payerName: paymentData.payerName, // Keep payer name for payment reconciliation
            payerEmail: paymentData.payerEmail,
            transactionStatus: paymentData.transactionStatus,
            // Add any available payment source details
            paymentSource: paymentData.paymentSource || null,
            fundingSource: paymentData.fundingSource || null
        };

        // Step 5: Send enrollment confirmation email
        // Step 5: Send enrollment confirmation email
        const emailResult = await sendEnrollmentConfirmationEmail(enrollmentEmailData);

        // Step 6: Record email tracking in Firestore
        let emailTrackingResult = null;
        try {
            emailTrackingResult = await recordEnrollmentEmail(enrollmentEmailData, emailResult, userId);
            if (emailTrackingResult.success) {
                console.log('Email tracking recorded with ID:', emailTrackingResult.emailRecordId);
            } else {
                console.error('Failed to record email tracking:', emailTrackingResult.error);
            }
        } catch (trackingError) {
            console.error('Error recording email tracking:', trackingError);
        }

        // Log email result but don't fail the enrollment if email fails
        if (emailResult.success) {
            console.log('Enrollment confirmation email sent successfully');
        } else if (emailResult.skipped) {
            console.log('Email service not configured, skipping email');
        } else {
            console.error('Failed to send enrollment confirmation email:', emailResult.error);
        }

        return {
            success: true,
            paymentRecordId: paymentResult.paymentRecordId,
            enrollmentId: enrollmentResult.enrollmentId,
            emailSent: emailResult.success,
            emailError: emailResult.success ? null : emailResult.error,
            emailTrackingId: emailTrackingResult?.emailRecordId || null,
            enrollmentData: enrollmentEmailData
        };

    } catch (error) {
        console.error('Error in complete enrollment process:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Updates course progress for an enrolled user
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Promise<Object>} Success/error response
 */
export const updateCourseProgress = async (userId, courseId, progress) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const enrollmentId = `${userId}_${courseId}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);

        const updateData = {
            progress: Math.min(Math.max(progress, 0), 100), // Ensure progress is between 0-100
            lastAccessed: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // If course is completed (100%), set completion timestamp
        if (progress >= 100) {
            updateData.completedAt = serverTimestamp();
            updateData.status = 'completed';
        }

        await updateDoc(enrollmentRef, updateData);

        return { success: true };

    } catch (error) {
        console.error('Error updating course progress:', error);
        return { success: false, error: error.message };
    }
};
