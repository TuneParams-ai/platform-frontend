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
    const zelleEmail = 'contact@tuneparams.com';

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
            <h4>💳 Secure Payment via Zelle</h4>
            <div className="zelle-info">
                <div className="zelle-qr">
                    <img src={zelleQrPath} alt="Zelle QR Code for HA Talent Tech" />
                    <div className="zelle-payee">{zelleName}</div>
                    <div className="zelle-email">{zelleEmail}</div>
                </div>
                <div className="zelle-details">
                    <div className="payment-instructions">
                        <h5>📋 Payment Instructions</h5>
                        <div className="instruction-steps">
                            <div className="step">
                                <span className="step-number">1</span>
                                <span className="step-text">Open your <strong>bank's mobile app</strong> (do not use your phone's camera directly)</span>
                            </div>
                            <div className="step">
                                <span className="step-number">2</span>
                                <span className="step-text">Navigate to the <strong>Zelle section</strong> within your banking app</span>
                            </div>
                            <div className="step">
                                <span className="step-number">3</span>
                                <span className="step-text">Either <strong>scan the QR code</strong> above or send to: <strong>{zelleEmail}</strong></span>
                            </div>
                            <div className="step">
                                <span className="step-number">4</span>
                                <span className="step-text">Enter the exact amount: <strong>${Number(coursePrice).toFixed(2)}</strong></span>
                            </div>
                            <div className="step">
                                <span className="step-number">5</span>
                                <span className="step-text">Complete the payment and note your <strong>transaction ID</strong></span>
                            </div>
                        </div>
                        <div className="important-note">
                            <strong>📌 Important:</strong> Your transaction ID will appear in your bank app's payment history immediately after sending. Please enter it below to verify your payment.
                        </div>
                    </div>
                </div>
            </div>

            <form className="manual-payment-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h5>📝 Payment Verification Details</h5>

                    <label>
                        Your Name (optional)
                        <input
                            type="text"
                            value={payerName}
                            onChange={(e) => setPayerName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </label>

                    <label>
                        Your Email (required) <span className="required">*</span>
                        <input
                            type="email"
                            value={payerEmail}
                            onChange={(e) => setPayerEmail(e.target.value)}
                            required
                            placeholder="Enter your email address"
                        />
                    </label>

                    <label>
                        Transaction ID (required) <span className="required">*</span>
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            required
                            placeholder="Enter Zelle transaction ID"
                        />
                        <small className="field-help">Find this in your bank app's payment history after sending</small>
                    </label>

                    <label>
                        Notes (optional)
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes or comments"
                            rows="3"
                        />
                    </label>
                </div>

                <div className="manual-submit-row">
                    <div className="payment-summary">
                        <span className="amount-label">Total Amount:</span>
                        <span className="amount-value">${Number(coursePrice).toFixed(2)}</span>
                    </div>
                    <button type="submit" className="btn btn-primary payment-submit-btn" disabled={submitting || disabled}>
                        {submitting ? '⏳ Verifying Payment...' : '✅ Verify Zelle Payment'}
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
