import React, { useState, useCallback } from 'react';
import PayPalCheckout from '../components/PayPalCheckout';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
import '../styles/paypal-checkout.css';

const PayPalTest = () => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const handlePaymentSuccess = useCallback((paymentDetails) => {
        console.log('Test Payment Successful:', paymentDetails);
        setPaymentData(paymentDetails);
        setShowSuccessModal(true);
    }, []);

    const handlePaymentError = useCallback((error) => {
        console.error('Test Payment Error:', error);
        alert('Payment failed: ' + error.message);
    }, []);

    const handlePaymentCancel = useCallback((data) => {
        console.log('Test Payment Cancelled:', data);
        alert('Payment was cancelled');
    }, []);

    return (
        <div style={{
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto',
            background: 'var(--background-color)',
            color: 'var(--text-color)',
            minHeight: '100vh'
        }}>
            <h1 style={{
                background: 'var(--metallic-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}>PayPal Integration Test</h1>
            <p>This is a test page to verify PayPal integration is working correctly.</p>

            <div style={{
                background: 'rgba(29, 126, 153, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid rgba(29, 126, 153, 0.2)'
            }}>
                <h3 style={{ color: 'var(--text-color)' }}>Test Course: React Development Fundamentals</h3>
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
                onGoToDashboard={() => {
                    setShowSuccessModal(false);
                    alert('Would redirect to dashboard');
                }}
                onDownloadReceipt={() => {
                    alert('Would download receipt');
                }}
            />

            <div style={{
                marginTop: '40px',
                padding: '20px',
                background: 'rgba(29, 126, 153, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(29, 126, 153, 0.2)'
            }}>
                <h4 style={{ color: 'var(--text-color)' }}>Testing Instructions:</h4>
                <ol>
                    <li>Click the PayPal button above</li>
                    <li>Use PayPal sandbox test accounts or test credit cards</li>
                    <li>Complete the payment process</li>
                    <li>Verify the success modal appears with correct details</li>
                </ol>

                <h4 style={{ color: 'var(--text-color)' }}>Test Credit Card Numbers:</h4>
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
