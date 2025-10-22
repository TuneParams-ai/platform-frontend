import React from 'react';
import '../styles/payment-success-modal.css';
import '../styles/components.css';

const PaymentSuccessModal = ({
    isOpen,
    onClose,
    paymentData,
    onGoToDashboard,
    enrollmentResult
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="payment-success-modal">
                <div className="success-header">
                    <div className="success-icon">{paymentData?.manualSubmission || enrollmentResult?.pendingManual ? '⏳' : '✅'}</div>
                    <h2>{paymentData?.manualSubmission || enrollmentResult?.pendingManual ? 'Submission Received' : 'Payment Successful!'}</h2>
                    <p>{paymentData?.manualSubmission || enrollmentResult?.pendingManual ? 'Your payment will be reviewed by an admin shortly.' : 'Welcome to your new course'}</p>
                </div>

                <div className="payment-details">
                    <h3>Payment Details</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="label">Course:</span>
                            <span className="value">{paymentData?.courseTitle}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Amount Paid:</span>
                            <span className="value">${paymentData?.amount}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Transaction ID:</span>
                            <span className="value">{paymentData?.paymentID}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Order ID:</span>
                            <span className="value">{paymentData?.orderID}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Date:</span>
                            <span className="value">
                                {new Date(paymentData?.timestamp).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="next-steps">
                    <h3>What's Next?</h3>
                    <ul>
                        {paymentData?.manualSubmission || enrollmentResult?.pendingManual ? (
                            <>
                                <li>📧 We'll notify you by email after an admin verifies your transaction.</li>
                                <li>� Your access will be granted once verification is complete.</li>
                            </>
                        ) : (
                            <>
                                <li>
                                    �📧 A confirmation email has been sent to {paymentData?.payerEmail}
                                    {enrollmentResult?.emailSent === false && (
                                        <span style={{ color: '#f57c00', marginLeft: '8px' }}>
                                            (Email service unavailable)
                                        </span>
                                    )}
                                </li>
                                <li>📚 You now have access to all course materials</li>
                                <li>🎯 You can start learning immediately</li>
                                <li>💬 Join our course community for support</li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="modal-actions">
                    <button
                        className="btn"
                        onClick={onGoToDashboard}
                    >
                        🚀 Go to Dashboard
                    </button>
                </div>

                <button
                    className="close-modal"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessModal;
