// src/services/manualPaymentService.js
// Service to record manual (Zelle) payments
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Record a manual payment in Firestore
 * @param {Object} payment - payment payload from the client
 * @param {string|null} userId - optional firebase auth uid
 * @returns {Promise<Object>} result object
 */
export const recordManualPayment = async (payment, userId = null) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const paymentDoc = {
            courseId: payment.courseId,
            courseTitle: payment.courseTitle,
            amount: parseFloat(payment.amount) || 0,
            payerName: payment.payerName || null,
            payerEmail: payment.payerEmail || null,
            transactionId: payment.transactionId || null,
            notes: payment.notes || null,
            userId: userId,
            paymentMethod: 'manual',
            status: 'pending_manual_verification',
            submittedAt: payment.timestamp ? new Date(payment.timestamp) : new Date(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const ref = await addDoc(collection(db, 'manual_payments'), paymentDoc);

        // Return success; leave record in pending_manual_verification for admin to verify
        return { success: true, manualPaymentId: ref.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default recordManualPayment;
