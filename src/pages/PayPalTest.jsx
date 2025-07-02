import React, { useState } from 'react';
import PayPalCheckout from '../components/PayPalCheckout';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
import '../styles/paypal-checkout.css';

const PayPalTest = () => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const handlePaymentSuccess = (paymentDetails) => {
        console.log('Test Payment Successful:', paymentDetails);
        setPaymentData(paymentDetails);
        setShowSuccessModal(true);
    };

    const handlePaymentError = (error) => {
        console.error('Test Payment Error:', error);
        alert('Payment failed: ' + error.message);
    };

    const handlePaymentCancel = (data) => {
        console.log('Test Payment Cancelled:', data);
        alert('Payment was cancelled');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>PayPal Integration Test</h1>
            <p>This is a test page to verify PayPal integration is working correctly.</p>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Test Course: React Development Fundamentals</h3>
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

            <div style={{ marginTop: '40px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
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
