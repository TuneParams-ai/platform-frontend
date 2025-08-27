import React, { useState, useCallback } from 'react';
import PayPalCheckout from '../components/PayPalCheckout';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
import EmailSetupGuide from '../components/EmailSetupGuide';
import { processCompleteEnrollment } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';
import '../styles/paypal-checkout.css';
import '../styles/paypal-test.css';

const PayPalTest = () => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [enrollmentResult, setEnrollmentResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useAuth();

    const handlePaymentSuccess = useCallback(async (paymentDetails) => {
        console.log('Test Payment Successful:', paymentDetails);
        setPaymentData(paymentDetails);
        setIsProcessing(true);

        try {
            // Process the complete enrollment (payment + enrollment + email)
            const result = await processCompleteEnrollment(paymentDetails, user?.uid || 'test-user');
            console.log('Complete enrollment result:', result);

            setEnrollmentResult(result);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error processing enrollment:', error);
            setEnrollmentResult({
                success: false,
                error: error.message,
                emailSent: false
            });
            setShowSuccessModal(true);
        } finally {
            setIsProcessing(false);
        }
    }, [user]);

    const handlePaymentError = useCallback((error) => {
        console.error('Test Payment Error:', error);
        alert('Payment failed: ' + error.message);
    }, []);

    const handlePaymentCancel = useCallback((data) => {
        console.log('Test Payment Cancelled:', data);
        alert('Payment was cancelled');
    }, []);

    return (
        <div className="paypal-test-container">
            <h1 className="paypal-test-title">PayPal Integration Test</h1>
            <p>This is a test page to verify PayPal integration is working correctly.</p>

            <EmailSetupGuide />

            <div className="test-course-info">
                <h3 className="test-course-title">Test Course: React Development Fundamentals</h3>
                <p>Price: $99</p>
                <p>This is a test transaction using PayPal sandbox.</p>
            </div>

            <PayPalCheckout
                courseId="TEST001"
                courseTitle="React Development Fundamentals"
                coursePrice={99}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
            />

            <PaymentSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                paymentData={paymentData}
                enrollmentResult={enrollmentResult || { emailSent: false }}
                onGoToDashboard={() => {
                    setShowSuccessModal(false);
                    alert('Would redirect to dashboard');
                }}
            />

            {isProcessing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <div>Processing enrollment and sending email...</div>
                    </div>
                </div>
            )}

            <div className="test-instructions">
                <h4>Testing Instructions:</h4>
                <ol>
                    <li>Click the PayPal button above</li>
                    <li>Use PayPal sandbox test accounts or test credit cards</li>
                    <li>Complete the payment process</li>
                    <li>Verify the success modal appears with correct details</li>
                </ol>

                <h4>Test Credit Card Numbers:</h4>
                <ul>
                    <li><strong>Visa:</strong> 4111111111111111</li>
                    <li><strong>Mastercard:</strong> 5555555555554444</li>
                    <li><strong>Expiry:</strong> Any future date</li>
                    <li><strong>CVV:</strong> 123</li>
                </ul>
            </div>
        </div>
    );
};

export default PayPalTest;
