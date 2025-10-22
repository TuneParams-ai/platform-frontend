import React, { useState } from 'react';
import { recordManualPayment } from '../services/manualPaymentService';
import zelleQr from '../data/zelle-qr.jpg';
import '../styles/manual-payment.css';

const ManualPaymentPanel = ({ courseId, courseTitle, coursePrice, user, onSuccess, onError, disabled = false }) => {
    const [payerName, setPayerName] = useState(user?.displayName || '');
    const [payerEmail, setPayerEmail] = useState(user?.email || '');
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Use bundled Zelle QR image from src/data
    const zelleQrPath = zelleQr;
    const zelleName = 'HA Talent Tech';
    const zelleNotice = 'Scan the QR or send via Zelle to the payee above. After sending, enter the transaction ID below for verification.';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!transactionId || !payerEmail) {
            setMessage({ type: 'error', text: 'Please provide your payer email and transaction ID.' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                courseId,
                courseTitle,
                amount: coursePrice,
                payerName: payerName || null,
                payerEmail,
                transactionId,
                notes,
                timestamp: new Date().toISOString()
            };

            const result = await recordManualPayment(payload, user?.uid || null);

            if (result.success) {
                setMessage({ type: 'success', text: 'Thank you — we received your manual payment details. We will verify and enroll you shortly.' });
                if (onSuccess) {
                    onSuccess({
                        // Indicate this is a manual payment submission pending admin verification
                        manualSubmission: true,
                        manualPaymentId: result.manualPaymentId,
                        transactionId,
                        courseId,
                        courseTitle,
                        amount: coursePrice,
                        payerEmail,
                        payerName,
                        timestamp: payload.timestamp
                    });
                }
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to record manual payment.' });
                if (onError) onError(new Error(result.error || 'Failed to record manual payment'));
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to submit manual payment.' });
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="manual-payment-panel">
            <h4>Manual Payment (Zelle)</h4>
            <div className="zelle-info">
                <div className="zelle-qr">
                    <img src={zelleQrPath} alt="Zelle QR" />
                    <div className="zelle-payee">{zelleName}</div>
                </div>
                <div className="zelle-details">
                    <p className="zelle-instruction">{zelleNotice}</p>
                </div>
            </div>

            <form className="manual-payment-form" onSubmit={handleSubmit}>
                <label>
                    Your Name (optional)
                    <input type="text" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </label>

                <label>
                    Your Email (required)
                    <input type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} required />
                </label>

                <label>
                    Transaction ID (required)
                    <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                </label>

                <label>
                    Notes (optional)
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </label>

                <div className="manual-submit-row">
                    <button type="submit" className="btn btn-primary" disabled={submitting || disabled}>
                        {submitting ? 'Submitting...' : `Submit Zelle Payment — $${Number(coursePrice).toFixed(2)}`}
                    </button>
                </div>

                {message && (
                    <div className={`manual-message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ManualPaymentPanel;
