import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUserRole } from '../hooks/useUserRole';
import { useAuth } from '../hooks/useAuth';
import { manualEnrollUser } from '../services/paymentService';
import { sendEnrollmentConfirmationEmail } from '../services/emailService';

const AdminManualPayments = () => {
    const { isAdminUser } = useUserRole();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdminUser) return;

        const loadPending = async () => {
            setLoading(true);
            const q = query(collection(db, 'manual_payments'), where('status', '==', 'pending_manual_verification'));
            const snap = await getDocs(q);
            const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPayments(rows);
            setLoading(false);
        };

        loadPending();
    }, [isAdminUser]);

    const { user } = useAuth();

    const verifyAndEnroll = async (payment) => {
        try {
            // Expect payment.userId or try to find by payerEmail (not implemented here)
            if (!payment.userId) {
                alert('No userId present on payment; please ensure the payer has an account before verifying.');
                return;
            }

            // Enroll user using existing admin function
            const adminUserId = user?.uid || 'admin';
            const enrollRes = await manualEnrollUser(payment.userId, payment.courseId, adminUserId, null, `Verified manual payment ${payment.transactionId || ''}`);

            if (!enrollRes.success) {
                alert(`Enrollment failed: ${enrollRes.error}`);
                return;
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

            // Update payment doc
            const mpRef = doc(db, 'manual_payments', payment.id);
            await updateDoc(mpRef, {
                status: 'verified_and_enrolled',
                enrollmentId: enrollRes.enrollmentId,
                enrollmentBatch: enrollRes.batchNumber,
                emailSent: emailRes.success || false,
                verifiedBy: adminUserId,
                verifiedAt: new Date()
            });

            alert('Enrollment completed and email sent.');
            // Refresh list
            setPayments(prev => prev.filter(p => p.id !== payment.id));

        } catch (error) {
            console.error('Verify error', error);
            alert('Verification failed: ' + (error.message || error));
        }
    };

    if (!isAdminUser) {
        return <div>You do not have permission to view this page.</div>;
    }

    if (loading) return <div>Loading pending manual payments...</div>;

    return (
        <div>
            <h3>Pending Manual Payments</h3>
            {payments.length === 0 && <p>No pending manual payments.</p>}
            <ul>
                {payments.map(p => (
                    <li key={p.id} style={{ marginBottom: 12, padding: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div><strong>{p.courseTitle}</strong> — {p.amount ? `$${p.amount}` : 'N/A'}</div>
                        <div>Transaction: {p.transactionId}</div>
                        <div>Payer: {p.payerName} ({p.payerEmail})</div>
                        <div style={{ marginTop: 8 }}>
                            <button className="btn btn-primary" onClick={() => verifyAndEnroll(p)}>Verify & Enroll</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminManualPayments;
