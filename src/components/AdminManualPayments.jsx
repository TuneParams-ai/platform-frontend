import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../hooks/useUserRole';
import { useAuth } from '../hooks/useAuth';
import { manualEnrollUser } from '../services/paymentService';
import { sendEnrollmentConfirmationEmail } from '../services/emailService';
import { getUserProfile } from '../services/userService';
import '../styles/admin-manual-payments.css';

const STATUS_TABS = {
    PENDING: 'pending_manual_verification',
    VERIFIED: 'verified_and_enrolled',
    ARCHIVED: 'archived',
    REJECTED: 'rejected'
};

const AdminManualPayments = () => {
    const { isAdminUser } = useUserRole();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(STATUS_TABS.PENDING);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState(null);
    const [statistics, setStatistics] = useState({
        totalVerified: 0,
        totalAmount: 0,
        count: 0
    });

    useEffect(() => {
        if (!isAdminUser) return;
        loadPayments(activeTab);
        loadStatistics();
    }, [isAdminUser, activeTab]);

    const loadPayments = async (status) => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'manual_payments'),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPayments(rows);
        } catch (error) {
            console.error('Error loading payments:', error);
            // If orderBy fails (missing index), try without ordering
            const q = query(collection(db, 'manual_payments'), where('status', '==', status));
            const snap = await getDocs(q);
            const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPayments(rows);
        }
        setLoading(false);
    };

    const loadStatistics = async () => {
        try {
            const q = query(collection(db, 'manual_payments'), where('status', '==', STATUS_TABS.VERIFIED));
            const snap = await getDocs(q);
            const verified = snap.docs.map(d => d.data());

            const totalAmount = verified.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            setStatistics({
                totalVerified: verified.length,
                totalAmount: totalAmount,
                count: verified.length
            });
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const showConfirmation = (payment) => {
        setConfirmModal(payment);
    };

    const cancelConfirmation = () => {
        setConfirmModal(null);
    };

    const recordManualPaymentInPaymentsCollection = async (payment, enrollmentId, batchNumber) => {
        try {
            const userProfile = await getUserProfile(payment.userId);
            const userData = userProfile.success ? userProfile.userData : null;

            const paymentRecord = {
                // Payment details
                paymentId: payment.transactionId || `manual_${Date.now()}`,
                orderId: enrollmentId,
                payerId: payment.userId,

                // Course details
                courseId: payment.courseId,
                courseTitle: payment.courseTitle,
                amount: parseFloat(payment.amount) || 0,
                originalAmount: parseFloat(payment.amount) || 0,

                // Coupon details (manual payments typically don't have coupons, but keep structure)
                appliedCoupon: null,
                discountAmount: 0,
                couponCode: null,

                // User details
                userId: payment.userId,
                userEmail: userData?.email || payment.payerEmail,
                userName: userData?.displayName || payment.payerName,

                // Keep payer data for reconciliation
                payerEmail: payment.payerEmail,
                payerName: payment.payerName,

                // Status and metadata
                status: 'completed',
                transactionStatus: 'Completed',
                paymentMethod: 'manual',

                // Manual payment specific fields
                manualPaymentId: payment.id,
                manualTransactionId: payment.transactionId,
                verifiedBy: user?.uid || 'admin',

                // Terms acceptance tracking
                termsAccepted: payment.termsAccepted || false,
                termsAcceptedAt: payment.termsAcceptedAt || null,

                // Enrollment reference
                enrollmentId: enrollmentId,
                batchNumber: batchNumber,

                // Timestamps
                paymentDate: payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const paymentRef = await addDoc(collection(db, 'payments'), paymentRecord);
            return { success: true, paymentRecordId: paymentRef.id };
        } catch (error) {
            console.error('Error recording payment:', error);
            return { success: false, error: error.message };
        }
    };

    const verifyAndEnroll = async (payment) => {
        try {
            if (!payment.userId) {
                alert('No userId present on payment; please ensure the payer has an account before verifying.');
                return;
            }

            const adminUserId = user?.uid || 'admin';

            // Enroll user using existing admin function
            const enrollRes = await manualEnrollUser(
                payment.userId,
                payment.courseId,
                adminUserId,
                null,
                `Verified manual payment ${payment.transactionId || ''}`
            );

            if (!enrollRes.success) {
                alert(`Enrollment failed: ${enrollRes.error}`);
                return;
            }

            // Record payment in payments collection
            const paymentRecordRes = await recordManualPaymentInPaymentsCollection(
                payment,
                enrollRes.enrollmentId,
                enrollRes.batchNumber
            );

            if (!paymentRecordRes.success) {
                console.error('Failed to record payment in payments collection:', paymentRecordRes.error);
                // Continue anyway since enrollment succeeded
            }

            // Send confirmation email
            const emailData = {
                userName: payment.payerName || payment.payerEmail?.split('@')[0] || 'Student',
                userEmail: payment.payerEmail,
                courseTitle: payment.courseTitle,
                courseId: payment.courseId,
                amount: payment.amount || 0,
                paymentId: payment.transactionId || null,
                orderId: enrollRes.enrollmentId,
                enrollmentId: enrollRes.enrollmentId,
                enrollmentDate: new Date().toLocaleString(),
                batchNumber: enrollRes.batchNumber,
                paymentMethod: 'manual',
                payerName: payment.payerName,
                payerEmail: payment.payerEmail,
                transactionStatus: 'Completed'
            };

            const emailRes = await sendEnrollmentConfirmationEmail(emailData);

            // Update manual payment doc
            const mpRef = doc(db, 'manual_payments', payment.id);
            await updateDoc(mpRef, {
                status: STATUS_TABS.VERIFIED,
                enrollmentId: enrollRes.enrollmentId,
                enrollmentBatch: enrollRes.batchNumber,
                paymentRecordId: paymentRecordRes.success ? paymentRecordRes.paymentRecordId : null,
                emailSent: emailRes.success || false,
                verifiedBy: adminUserId,
                verifiedAt: new Date()
            });

            alert('✅ Enrollment completed, payment recorded, and email sent successfully!');
            setConfirmModal(null);
            loadPayments(activeTab);
            loadStatistics(); // Refresh statistics
        } catch (error) {
            console.error('Verify error', error);
            alert('Verification failed: ' + (error.message || error));
        }
    };

    const updatePaymentStatus = async (payment, newStatus, notes = '') => {
        try {
            const mpRef = doc(db, 'manual_payments', payment.id);
            const adminUserId = user?.uid || 'admin';

            const updateData = {
                status: newStatus,
                lastModifiedBy: adminUserId,
                lastModifiedAt: new Date()
            };

            if (notes) {
                updateData.adminNotes = notes;
            }

            await updateDoc(mpRef, updateData);
            alert('Payment status updated.');
            loadPayments(activeTab);
        } catch (error) {
            console.error('Update error', error);
            alert('Update failed: ' + (error.message || error));
        }
    };

    const handleArchive = (payment) => {
        const notes = prompt('Archive notes (optional):');
        if (notes !== null) { // null means cancelled
            updatePaymentStatus(payment, STATUS_TABS.ARCHIVED, notes);
        }
    };

    const handleReject = (payment) => {
        const reason = prompt('Rejection reason (required):');
        if (reason && reason.trim()) {
            updatePaymentStatus(payment, STATUS_TABS.REJECTED, reason);
        } else if (reason !== null) {
            alert('Please provide a rejection reason.');
        }
    };

    const handleUnarchive = (payment) => {
        updatePaymentStatus(payment, STATUS_TABS.PENDING, 'Unarchived');
    };

    const handleUnreject = (payment) => {
        updatePaymentStatus(payment, STATUS_TABS.PENDING, 'Unreject - moved back to pending');
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString();
        } catch {
            return 'Invalid date';
        }
    };

    if (!isAdminUser) {
        return <div>You do not have permission to view this page.</div>;
    }

    return (
        <div className="admin-manual-payments">
            <h3>Manual Payments Management</h3>

            {/* Statistics Summary */}
            <div className="payment-statistics">
                <div className="stat-card">
                    <div className="stat-label">Total Verified Payments</div>
                    <div className="stat-value">{statistics.count}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Amount Received</div>
                    <div className="stat-value">${statistics.totalAmount.toFixed(2)}</div>
                </div>
            </div>

            <div className="payment-status-tabs">
                <button
                    className={`status-tab ${activeTab === STATUS_TABS.PENDING ? 'active' : ''}`}
                    onClick={() => setActiveTab(STATUS_TABS.PENDING)}
                >
                    ⏳ Pending
                </button>
                <button
                    className={`status-tab ${activeTab === STATUS_TABS.VERIFIED ? 'active' : ''}`}
                    onClick={() => setActiveTab(STATUS_TABS.VERIFIED)}
                >
                    ✅ Verified & Enrolled
                </button>
                <button
                    className={`status-tab ${activeTab === STATUS_TABS.ARCHIVED ? 'active' : ''}`}
                    onClick={() => setActiveTab(STATUS_TABS.ARCHIVED)}
                >
                    📦 Archived
                </button>
                <button
                    className={`status-tab ${activeTab === STATUS_TABS.REJECTED ? 'active' : ''}`}
                    onClick={() => setActiveTab(STATUS_TABS.REJECTED)}
                >
                    ❌ Rejected
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading payments...</div>
            ) : (
                <div className="payments-list">
                    {payments.length === 0 ? (
                        <p className="no-payments">No {activeTab.replace('_', ' ')} payments.</p>
                    ) : (
                        <div className="payment-cards">
                            {payments.map(p => (
                                <div key={p.id} className="payment-card">
                                    <div className="payment-header">
                                        <strong>{p.courseTitle}</strong>
                                        <span className="payment-amount">
                                            {p.amount ? `$${p.amount}` : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="payment-details">
                                        <div className="detail-row">
                                            <span className="label">Transaction ID:</span>
                                            <span className="value">{p.transactionId || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Payer:</span>
                                            <span className="value">{p.payerName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Email:</span>
                                            <span className="value">{p.payerEmail}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Submitted:</span>
                                            <span className="value">{formatDate(p.createdAt)}</span>
                                        </div>
                                        {p.notes && (
                                            <div className="detail-row">
                                                <span className="label">User Notes:</span>
                                                <span className="value">{p.notes}</span>
                                            </div>
                                        )}
                                        {p.adminNotes && (
                                            <div className="detail-row admin-notes">
                                                <span className="label">Admin Notes:</span>
                                                <span className="value">{p.adminNotes}</span>
                                            </div>
                                        )}
                                        {p.enrollmentId && (
                                            <div className="detail-row">
                                                <span className="label">Enrollment ID:</span>
                                                <span className="value">{p.enrollmentId}</span>
                                            </div>
                                        )}
                                        {p.verifiedAt && (
                                            <div className="detail-row">
                                                <span className="label">Verified:</span>
                                                <span className="value">{formatDate(p.verifiedAt)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="payment-actions">
                                        {activeTab === STATUS_TABS.PENDING && (
                                            <>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => showConfirmation(p)}
                                                    disabled={!p.userId}
                                                    title={!p.userId ? 'No user ID - cannot auto-enroll' : ''}
                                                >
                                                    ✓ Verify & Enroll
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleArchive(p)}
                                                >
                                                    📦 Archive
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleReject(p)}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </>
                                        )}
                                        {activeTab === STATUS_TABS.VERIFIED && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleArchive(p)}
                                            >
                                                📦 Archive
                                            </button>
                                        )}
                                        {activeTab === STATUS_TABS.ARCHIVED && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleUnarchive(p)}
                                            >
                                                ↩️ Restore to Pending
                                            </button>
                                        )}
                                        {activeTab === STATUS_TABS.REJECTED && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleUnreject(p)}
                                            >
                                                ↩️ Move to Pending
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="confirmation-modal-overlay" onClick={cancelConfirmation}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>⚠️ Confirm Payment Verification</h4>
                        <p>Please review the payment details carefully before approving:</p>

                        <div className="confirmation-details">
                            <div className="confirm-row">
                                <strong>Course:</strong>
                                <span>{confirmModal.courseTitle}</span>
                            </div>
                            <div className="confirm-row">
                                <strong>Amount:</strong>
                                <span className="amount-highlight">${confirmModal.amount || 0}</span>
                            </div>
                            <div className="confirm-row">
                                <strong>Transaction ID:</strong>
                                <span>{confirmModal.transactionId || 'N/A'}</span>
                            </div>
                            <div className="confirm-row">
                                <strong>Payer:</strong>
                                <span>{confirmModal.payerName}</span>
                            </div>
                            <div className="confirm-row">
                                <strong>Email:</strong>
                                <span>{confirmModal.payerEmail}</span>
                            </div>
                            <div className="confirm-row">
                                <strong>Submitted:</strong>
                                <span>{formatDate(confirmModal.createdAt)}</span>
                            </div>
                            {confirmModal.notes && (
                                <div className="confirm-row notes-row">
                                    <strong>User Notes:</strong>
                                    <span>{confirmModal.notes}</span>
                                </div>
                            )}
                        </div>

                        <div className="confirmation-checklist">
                            <h5>✅ Pre-approval Checklist:</h5>
                            <ul>
                                <li>✓ Transaction ID matches bank/Zelle records</li>
                                <li>✓ Amount received matches the listed amount</li>
                                <li>✓ Payer information is correct</li>
                                <li>✓ No duplicate payment for same course/user</li>
                            </ul>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-cancel" onClick={cancelConfirmation}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-confirm"
                                onClick={() => verifyAndEnroll(confirmModal)}
                            >
                                ✓ Confirm & Process
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManualPayments;
