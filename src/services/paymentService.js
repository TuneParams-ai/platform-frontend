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
import { findCourseById, getNextAvailableBatch } from '../data/coursesData';

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
 * Automatically assigns user to the next available batch
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @param {Object} paymentData - Payment details
 * @param {string} userEmail - User's email address
 * @returns {Promise<Object>} Success/error response
 */
export const enrollUserInCourse = async (userId, courseId, paymentData, userEmail = null) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        // Get course data to determine next available batch
        const course = findCourseById(courseId);
        if (!course) {
            throw new Error(`Course not found: ${courseId}`);
        }

        // Automatically determine the next available batch
        const nextBatch = getNextAvailableBatch(course);
        if (!nextBatch) {
            throw new Error('No available batches for enrollment');
        }

        const enrollment = {
            userId: userId,
            userEmail: userEmail, // Add user email
            courseId: courseId,
            courseTitle: paymentData.courseTitle || course.title,

            // Batch information - automatically assigned
            batchNumber: nextBatch.batchNumber,
            batchStartDate: nextBatch.startDate,
            batchEndDate: nextBatch.endDate,
            batchStatus: nextBatch.status,

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

        // Use a combination of userId, courseId, and batchNumber as document ID to prevent duplicates
        const enrollmentId = `${userId}_${courseId}_batch${nextBatch.batchNumber}`;
        const enrollmentRef = doc(db, 'enrollments', enrollmentId);

        await setDoc(enrollmentRef, enrollment);

        console.log('User enrolled in course:', enrollmentId, 'Batch:', nextBatch.batchNumber);
        return {
            success: true,
            enrollmentId: enrollmentId,
            batchNumber: nextBatch.batchNumber,
            batchInfo: {
                startDate: nextBatch.startDate,
                endDate: nextBatch.endDate,
                status: nextBatch.status
            }
        };

    } catch (error) {
        console.error('Error enrolling user in course:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Checks if a user has access to a specific course
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Optional batch number to check specific batch access
 * @returns {Promise<Object>} Access status and enrollment details
 */
export const checkCourseAccess = async (userId, courseId, batchNumber = null) => {
    try {
        if (!db) {
            return { hasAccess: false, error: 'Firestore not initialized' };
        }

        // If batch number is specified, check specific batch enrollment
        if (batchNumber) {
            const enrollmentId = `${userId}_${courseId}_batch${batchNumber}`;
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
        }

        // Check for any enrollment in this course (any batch)
        const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('userId', '==', userId),
            where('courseId', '==', courseId),
            where('status', '==', 'enrolled')
        );

        const querySnapshot = await getDocs(enrollmentsQuery);

        if (querySnapshot.empty) {
            return { hasAccess: false, enrollment: null };
        }

        // Get the most recent enrollment (in case of multiple batches)
        let latestEnrollment = null;
        let latestEnrollmentDoc = null;

        querySnapshot.forEach((doc) => {
            const enrollment = doc.data();
            if (!latestEnrollment ||
                (enrollment.enrolledAt && (!latestEnrollment.enrolledAt ||
                    enrollment.enrolledAt.toDate() > latestEnrollment.enrolledAt.toDate()))) {
                latestEnrollment = enrollment;
                latestEnrollmentDoc = doc;
            }
        });

        if (latestEnrollment && latestEnrollmentDoc) {
            // Update last accessed timestamp for the latest enrollment
            await updateDoc(latestEnrollmentDoc.ref, {
                lastAccessed: serverTimestamp()
            });

            return {
                hasAccess: true,
                enrollment: {
                    ...latestEnrollment,
                    id: latestEnrollmentDoc.id
                },
                allEnrollments: querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
            };
        }

        return { hasAccess: false, enrollment: null };

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
 * Automatically assigns user to the next available batch
 * @param {Object} paymentData - Payment details from PayPal
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} Complete enrollment result
 */
export const processCompleteEnrollment = async (paymentData, userId) => {
    try {
        console.log('Starting complete enrollment process...', { paymentData, userId });

        // Step 1: Get logged-in user profile for email (moved up to use in enrollment)
        const userProfile = await getUserProfile(userId);
        const userData = userProfile.success ? userProfile.userData : null;
        const userEmail = userData?.email;

        // Step 2: Record the payment
        const paymentResult = await recordPayment(paymentData, userId);
        if (!paymentResult.success) {
            throw new Error(`Payment recording failed: ${paymentResult.error}`);
        }

        // Step 3: Enroll user in the course (batch automatically determined) with email
        const enrollmentResult = await enrollUserInCourse(userId, paymentData.courseId, paymentData, userEmail);
        if (!enrollmentResult.success) {
            throw new Error(`Enrollment failed: ${enrollmentResult.error}`);
        }

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
            // Add batch information (automatically assigned)
            batchNumber: enrollmentResult.batchNumber,
            batchStartDate: enrollmentResult.batchInfo?.startDate,
            batchEndDate: enrollmentResult.batchInfo?.endDate,
            batchStatus: enrollmentResult.batchInfo?.status,
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
            batchNumber: enrollmentResult.batchNumber,
            batchInfo: enrollmentResult.batchInfo,
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
 * @param {number} batchNumber - Optional batch number to update specific batch progress
 * @returns {Promise<Object>} Success/error response
 */
export const updateCourseProgress = async (userId, courseId, progress, batchNumber = null) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        let enrollmentRef;

        if (batchNumber) {
            // Update specific batch enrollment
            const enrollmentId = `${userId}_${courseId}_batch${batchNumber}`;
            enrollmentRef = doc(db, 'enrollments', enrollmentId);

            // Verify the enrollment exists
            const enrollmentDoc = await getDoc(enrollmentRef);
            if (!enrollmentDoc.exists()) {
                throw new Error(`No enrollment found for batch ${batchNumber}`);
            }
        } else {
            // Find the most recent active enrollment for this course
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('userId', '==', userId),
                where('courseId', '==', courseId),
                where('status', 'in', ['enrolled', 'active'])
            );

            const querySnapshot = await getDocs(enrollmentsQuery);

            if (querySnapshot.empty) {
                throw new Error('No active enrollment found for this course');
            }

            // Get the most recent enrollment
            let latestEnrollmentDoc = null;
            let latestEnrollmentDate = null;

            querySnapshot.forEach((doc) => {
                const enrollment = doc.data();
                const enrollmentDate = enrollment.enrolledAt?.toDate();

                if (!latestEnrollmentDate || (enrollmentDate && enrollmentDate > latestEnrollmentDate)) {
                    latestEnrollmentDate = enrollmentDate;
                    latestEnrollmentDoc = doc;
                }
            });

            if (!latestEnrollmentDoc) {
                throw new Error('Could not determine latest enrollment');
            }

            enrollmentRef = latestEnrollmentDoc.ref;
        }

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

        return { success: true, enrollmentId: enrollmentRef.id };

    } catch (error) {
        console.error('Error updating course progress:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Manually enroll a user in a course (admin function)
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course identifier
 * @param {string} adminUserId - Admin user ID performing the enrollment
 * @param {number} batchNumber - Optional specific batch number (defaults to next available)
 * @param {string} notes - Optional notes about the manual enrollment
 * @returns {Promise<Object>} Success/error response
 */
export const manualEnrollUser = async (userId, courseId, adminUserId, batchNumber = null, notes = '') => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        // Get course data to determine batch
        const course = findCourseById(courseId);
        if (!course) {
            throw new Error(`Course not found: ${courseId}`);
        }

        // Determine target batch
        let targetBatch;
        if (batchNumber) {
            targetBatch = course.batches?.find(b => b.batchNumber === batchNumber);
            if (!targetBatch) {
                throw new Error(`Batch ${batchNumber} not found for course ${courseId}`);
            }
        } else {
            targetBatch = getNextAvailableBatch(course);
            if (!targetBatch) {
                throw new Error('No available batches for enrollment');
            }
        }

        // Check if user is already enrolled in this batch
        const existingEnrollmentId = `${userId}_${courseId}_batch${targetBatch.batchNumber}`;
        const existingEnrollmentRef = doc(db, 'enrollments', existingEnrollmentId);
        const existingEnrollmentDoc = await getDoc(existingEnrollmentRef);

        if (existingEnrollmentDoc.exists()) {
            throw new Error(`User is already enrolled in ${course.title} - Batch ${targetBatch.batchNumber}`);
        }

        // Get user profile to include email
        const userProfile = await getUserProfile(userId);
        const userData = userProfile.success ? userProfile.userData : null;
        const userEmail = userData?.email;

        const enrollment = {
            userId: userId,
            userEmail: userEmail, // Add user email
            courseId: courseId,
            courseTitle: course.title,

            // Batch information
            batchNumber: targetBatch.batchNumber,
            batchStartDate: targetBatch.startDate,
            batchEndDate: targetBatch.endDate,
            batchStatus: targetBatch.status,

            // Enrollment status
            status: 'enrolled',
            progress: 0,

            // Manual enrollment details
            enrollmentType: 'manual',
            manualEnrollmentBy: adminUserId,
            manualEnrollmentNotes: notes,
            amountPaid: 0, // No payment for manual enrollment

            // Timestamps
            enrolledAt: serverTimestamp(),
            lastAccessed: null,
            completedAt: null,

            // Metadata
            paymentMethod: 'manual',
            enrollmentSource: 'admin_manual'
        };

        // Create enrollment record
        await setDoc(existingEnrollmentRef, enrollment);

        console.log('Manual enrollment created:', existingEnrollmentId);
        return {
            success: true,
            enrollmentId: existingEnrollmentId,
            batchNumber: targetBatch.batchNumber,
            batchInfo: {
                startDate: targetBatch.startDate,
                endDate: targetBatch.endDate,
                status: targetBatch.status,
                batchName: targetBatch.batchName
            }
        };

    } catch (error) {
        console.error('Error in manual enrollment:', error);
        return { success: false, error: error.message };
    }
};
