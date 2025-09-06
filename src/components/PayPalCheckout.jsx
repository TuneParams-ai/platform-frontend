import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import CouponInput from './CouponInput';
import { recordCouponUsage } from '../services/couponService';
import { processDirectEnrollment } from '../services/paymentService';
import '../styles/paypal-checkout.css';

const PayPalCheckout = ({
    courseId,
    courseTitle,
    coursePrice,
    onSuccess,
    onError,
    onCancel,
    disabled = false
}) => {
    const { user } = useAuth();
    const paypalRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // Coupon state
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [finalPrice, setFinalPrice] = useState(coursePrice);
    const [originalPrice] = useState(coursePrice);

    // PayPal Client ID - Must be configured in environment variables
    const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

    useEffect(() => {
        // Only load PayPal SDK if Client ID is configured
        if (!PAYPAL_CLIENT_ID) {
            setIsLoading(false);
            return;
        }

        // Load PayPal SDK
        const loadPayPalScript = () => {
            if (window.paypal) {
                setPaypalLoaded(true);
                setIsLoading(false);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
            script.async = true;
            script.onload = () => {
                setPaypalLoaded(true);
                setIsLoading(false);
            };
            script.onerror = () => {
                console.error('PayPal SDK failed to load');
                setIsLoading(false);
                if (onError) {
                    onError(new Error('PayPal SDK failed to load'));
                }
            };
            document.body.appendChild(script);
        };

        loadPayPalScript();
    }, [PAYPAL_CLIENT_ID, onError]);

    // Coupon handlers
    const handleCouponApplied = (couponData) => {
        setAppliedCoupon(couponData);
        setFinalPrice(couponData.finalAmount);
    };

    const handleCouponRemoved = () => {
        setAppliedCoupon(null);
        setFinalPrice(originalPrice);
    };

    // Handle 100% off coupon direct enrollment
    const handleDirectEnrollment = async () => {
        if (!user || !appliedCoupon || finalPrice > 0) {
            return;
        }

        try {
            console.log('Processing direct enrollment for 100% off coupon...');

            const enrollmentData = {
                courseId,
                courseTitle,
                originalAmount: originalPrice,
                termsAccepted,
                appliedCoupon
            };

            const result = await processDirectEnrollment(enrollmentData, user.uid);

            if (result.success) {
                // Call the success handler with enrollment details
                if (onSuccess) {
                    onSuccess({
                        orderID: result.orderId,
                        payerID: user.uid,
                        paymentID: result.paymentId,
                        courseId,
                        courseTitle,
                        amount: 0,
                        originalAmount: originalPrice,
                        payerEmail: user.email,
                        payerName: user.displayName || user.email?.split('@')[0] || 'Student',
                        transactionStatus: 'Free_Enrollment',
                        timestamp: new Date().toISOString(),
                        paymentSource: null,
                        fundingSource: 'Coupon_100_Percent_Off',
                        termsAccepted: termsAccepted,
                        termsAcceptedAt: new Date().toISOString(),
                        appliedCoupon: appliedCoupon,
                        enrollmentType: 'free_coupon',
                        enrollmentId: result.enrollmentId,
                        batchNumber: result.batchNumber,
                        batchInfo: result.batchInfo
                    });
                }
            } else {
                console.error('Direct enrollment failed:', result.error);
                if (onError) {
                    onError(new Error(result.error));
                }
            }
        } catch (error) {
            console.error('Error in direct enrollment:', error);
            if (onError) {
                onError(error);
            }
        }
    };

    const renderPayPalButton = useCallback(() => {
        if (paypalRef.current && window.paypal) {
            // Clear any existing PayPal button
            paypalRef.current.innerHTML = '';

            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: finalPrice.toString(),
                                currency_code: 'USD'
                            },
                            description: appliedCoupon
                                ? `Enrollment for ${courseTitle} (Coupon: ${appliedCoupon.couponCode})`
                                : `Enrollment for ${courseTitle}`,
                            custom_id: courseId,
                            soft_descriptor: 'TuneParams Course'
                        }],
                        application_context: {
                            brand_name: 'TuneParams.ai',
                            landing_page: 'BILLING',
                            user_action: 'PAY_NOW'
                        }
                    });
                },
                onApprove: async (data, actions) => {
                    try {
                        const order = await actions.order.capture();
                        console.log('Payment successful:', order);

                        // Call the success handler with payment details
                        if (onSuccess) {
                            // Format payer name properly (PayPal returns an object)
                            const payerName = order.payer.name
                                ? `${order.payer.name.given_name || ''} ${order.payer.name.surname || ''}`.trim()
                                : 'Student';

                            // Extract payment source information
                            const paymentSource = order.purchase_units[0].payments.captures[0].payment_source || {};
                            const fundingSource = order.purchase_units[0].payments.captures[0].funding_source || null;

                            onSuccess({
                                orderID: order.id,
                                payerID: order.payer.payer_id,
                                paymentID: order.purchase_units[0].payments.captures[0].id,
                                courseId,
                                courseTitle,
                                amount: finalPrice,
                                originalAmount: originalPrice,
                                payerEmail: order.payer.email_address,
                                payerName: payerName,
                                transactionStatus: order.status,
                                timestamp: new Date().toISOString(),
                                // Add payment method details
                                paymentSource: paymentSource,
                                fundingSource: fundingSource,
                                // Add payer address if available
                                payerAddress: order.payer.address || null,
                                // Add terms acceptance data
                                termsAccepted: termsAccepted,
                                termsAcceptedAt: new Date().toISOString(),
                                // Add coupon data if applied
                                appliedCoupon: appliedCoupon
                            });

                            // Record coupon usage if coupon was applied
                            if (appliedCoupon) {
                                try {
                                    await recordCouponUsage(appliedCoupon.couponId, user?.uid, courseId, {
                                        orderAmount: originalPrice,
                                        discountAmount: appliedCoupon.discountAmount,
                                        finalAmount: finalPrice,
                                        paymentId: order.purchase_units[0].payments.captures[0].id,
                                        orderId: order.id
                                    });
                                } catch (couponError) {
                                    console.error('Failed to record coupon usage:', couponError);
                                    // Don't fail the payment for coupon recording errors
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error capturing payment:', error);
                        if (onError) {
                            onError(error);
                        }
                    }
                },
                onError: (err) => {
                    console.error('PayPal error:', err);
                    if (onError) {
                        onError(err);
                    }
                },
                onCancel: (data) => {
                    console.log('Payment cancelled:', data);
                    if (onCancel) {
                        onCancel(data);
                    }
                },
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal',
                    height: 45
                }
            }).render(paypalRef.current);
        }
    }, [finalPrice, courseTitle, courseId, onSuccess, onError, onCancel, appliedCoupon, originalPrice, termsAccepted, user]);

    useEffect(() => {
        if (paypalLoaded && !disabled && finalPrice > 0 && termsAccepted) {
            renderPayPalButton();
        } else if (paypalRef.current) {
            // Clear PayPal button if terms not accepted
            paypalRef.current.innerHTML = '';
        }
    }, [paypalLoaded, disabled, finalPrice, termsAccepted, renderPayPalButton]);

    // Validate PayPal Client ID is configured (after all hooks)
    if (!PAYPAL_CLIENT_ID) {
        console.error('PayPal Client ID not configured. Please set REACT_APP_PAYPAL_CLIENT_ID in your .env file');
        return (
            <div style={{
                padding: '20px',
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                color: '#856404',
                textAlign: 'center'
            }}>
                <p>⚠️ PayPal payment is not configured.</p>
                <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
                    Please contact support to enable payments.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="paypal-loading">
                <div className="loading-spinner"></div>
                <p>Loading PayPal...</p>
            </div>
        );
    }

    if (!paypalLoaded) {
        return (
            <div className="paypal-error">
                <p>Failed to load PayPal. Please refresh the page and try again.</p>
            </div>
        );
    }

    if (disabled) {
        return (
            <div className="paypal-disabled">
                <p>Payment not available for this course.</p>
            </div>
        );
    }

    // Handle 100% off coupon case - show direct enrollment
    if (finalPrice <= 0 && appliedCoupon) {
        return (
            <div className="paypal-checkout-container">
                {/* Coupon Input Section */}
                {user && (
                    <CouponInput
                        userId={user.uid}
                        courseId={courseId}
                        originalAmount={originalPrice}
                        onCouponApplied={handleCouponApplied}
                        onCouponRemoved={handleCouponRemoved}
                        disabled={disabled}
                    />
                )}

                <div className="payment-summary">
                    <h4>Enrollment Summary</h4>
                    <div className="payment-details">
                        <div className="payment-item">
                            <span>Course:</span>
                            <span>{courseTitle}</span>
                        </div>
                        <div className="payment-item">
                            <span>Original Price:</span>
                            <span>${originalPrice.toFixed(2)}</span>
                        </div>
                        <div className="payment-item discount-item">
                            <span>Discount ({appliedCoupon.couponCode}):</span>
                            <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="payment-item total free-total">
                            <span><strong>Total:</strong></span>
                            <span><strong>FREE!</strong></span>
                        </div>
                        <div className="savings-info free-course">
                            Congratulations! You get this course for FREE with your coupon!
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions Section */}
                <div className="terms-conditions-section">
                    <div className="terms-checkbox-container">
                        <label className="terms-checkbox-label">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="terms-checkbox"
                            />
                            <span className="checkmark"></span>
                            <span className="terms-text">
                                I agree to the <button type="button" className="terms-link" onClick={() => setShowTermsModal(true)}>Terms and Conditions</button> and <button type="button" className="terms-link" onClick={() => setShowPrivacyModal(true)}>Privacy Policy</button>
                            </span>
                        </label>
                    </div>
                    {!termsAccepted && (
                        <p className="terms-requirement">
                            Please accept the Terms and Conditions to proceed with enrollment.
                        </p>
                    )}
                </div>

                {/* Direct Enrollment Button */}
                <div className="direct-enrollment-section">
                    <button
                        onClick={handleDirectEnrollment}
                        disabled={!termsAccepted}
                        className={`direct-enrollment-btn ${!termsAccepted ? 'disabled' : ''}`}
                    >
                        Enroll Now - FREE!
                    </button>
                    {!termsAccepted && (
                        <div className="enrollment-disabled-overlay">
                            <p>Accept terms to enable enrollment</p>
                        </div>
                    )}
                </div>

                <div className="enrollment-security">
                    <p>🎓 Free enrollment with 100% off coupon</p>
                    <p>No payment required - instant access after enrollment</p>
                </div>

                {/* Terms and Conditions Modal */}
                {showTermsModal && (
                    <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
                        <div className="modal-content terms-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Terms and Conditions</h2>
                                <button className="modal-close" onClick={() => setShowTermsModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="terms-content">
                                    <h3>Course Enrollment Terms</h3>
                                    <p><strong>Effective Date:</strong> [TO BE UPDATED]</p>

                                    <h4>1. Course Access and Duration</h4>
                                    <p>Upon successful enrollment and payment, you will gain access to the course materials for the duration specified in the course description. Access begins on the batch start date and continues through the course completion.</p>

                                    <h4>2. Payment and Refund Policy</h4>
                                    <p>[PLACEHOLDER] - Refund terms and conditions to be defined. Generally, refunds may be available within the first 7 days of course start, subject to specific conditions.</p>

                                    <h4>3. Course Completion and Certification</h4>
                                    <p>Course completion requirements will be communicated during the course. Certificates may be provided upon successful completion of all course requirements.</p>

                                    <h4>4. Code of Conduct</h4>
                                    <p>Students are expected to maintain respectful and professional conduct in all course interactions, including live sessions, forums, and group activities.</p>

                                    <h4>5. Intellectual Property</h4>
                                    <p>All course materials, including videos, slides, and assignments, are proprietary to TuneParams.ai and are for personal educational use only.</p>

                                    <h4>6. Technical Requirements</h4>
                                    <p>Students are responsible for ensuring they have the necessary technical requirements and stable internet connection to participate in online sessions.</p>

                                    <p><em>Note: These terms are subject to updates. Full terms and conditions will be provided upon enrollment completion.</em></p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => setShowTermsModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy Policy Modal */}
                {showPrivacyModal && (
                    <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
                        <div className="modal-content privacy-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Privacy Policy</h2>
                                <button className="modal-close" onClick={() => setShowPrivacyModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="privacy-content">
                                    <h3>Privacy Policy</h3>
                                    <p><strong>Effective Date:</strong> [TO BE UPDATED]</p>

                                    <h4>1. Information We Collect</h4>
                                    <p>We collect information necessary for course enrollment, including name, email address, payment information, and course progress data.</p>

                                    <h4>2. How We Use Your Information</h4>
                                    <p>Your information is used to provide course access, communicate course updates, process payments, and improve our educational services.</p>

                                    <h4>3. Information Sharing</h4>
                                    <p>[PLACEHOLDER] - We do not sell or share personal information with third parties except as necessary for course delivery and payment processing.</p>

                                    <h4>4. Data Security</h4>
                                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

                                    <h4>5. Your Rights</h4>
                                    <p>You have the right to access, update, or delete your personal information. Contact us for any privacy-related requests.</p>

                                    <h4>6. Contact Information</h4>
                                    <p>For privacy-related questions, please contact us at [CONTACT EMAIL TO BE ADDED].</p>

                                    <p><em>Note: This privacy policy is subject to updates. Full privacy policy will be provided upon enrollment completion.</em></p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => setShowPrivacyModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Show message for courses with price 0 but no coupon applied
    if (finalPrice <= 0) {
        return (
            <div className="paypal-disabled">
                <p>Payment not available for this course.</p>
            </div>
        );
    }

    return (
        <div className="paypal-checkout-container">
            {/* Coupon Input Section */}
            {user && (
                <CouponInput
                    userId={user.uid}
                    courseId={courseId}
                    originalAmount={originalPrice}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                    disabled={disabled}
                />
            )}

            <div className="payment-summary">
                <h4>Payment Summary</h4>
                <div className="payment-details">
                    <div className="payment-item">
                        <span>Course:</span>
                        <span>{courseTitle}</span>
                    </div>
                    {appliedCoupon && (
                        <>
                            <div className="payment-item">
                                <span>Original Price:</span>
                                <span>${originalPrice.toFixed(2)}</span>
                            </div>
                            <div className="payment-item discount-item">
                                <span>Discount ({appliedCoupon.couponCode}):</span>
                                <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                    <div className="payment-item total">
                        <span>Total:</span>
                        <span>${finalPrice.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && appliedCoupon.savings > 0 && (
                        <div className="savings-info">
                            You save ${appliedCoupon.savings.toFixed(2)}!
                        </div>
                    )}
                </div>
            </div>

            {/* Terms and Conditions Section */}
            <div className="terms-conditions-section">
                <div className="terms-checkbox-container">
                    <label className="terms-checkbox-label">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="terms-checkbox"
                        />
                        <span className="checkmark"></span>
                        <span className="terms-text">
                            I agree to the <button type="button" className="terms-link" onClick={() => setShowTermsModal(true)}>Terms and Conditions</button> and <button type="button" className="terms-link" onClick={() => setShowPrivacyModal(true)}>Privacy Policy</button>
                        </span>
                    </label>
                </div>
                {!termsAccepted && (
                    <p className="terms-requirement">
                        Please accept the Terms and Conditions to proceed with payment.
                    </p>
                )}
            </div>

            <div
                ref={paypalRef}
                className="paypal-button-container"
                style={{
                    minHeight: '45px',
                    opacity: termsAccepted ? 1 : 0.5,
                    pointerEvents: termsAccepted ? 'auto' : 'none'
                }}
            />
            {!termsAccepted && (
                <div className="payment-disabled-overlay">
                    <p>Accept terms to enable payment</p>
                </div>
            )}
            <div className="payment-security">
                <p>🔒 Secure payment powered by PayPal</p>
                <p>Your payment information is encrypted and secure</p>
            </div>

            {/* Terms and Conditions Modal */}
            {showTermsModal && (
                <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
                    <div className="modal-content terms-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Terms and Conditions</h2>
                            <button className="modal-close" onClick={() => setShowTermsModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="terms-content">
                                <h3>Course Enrollment Terms</h3>
                                <p><strong>Effective Date:</strong> [TO BE UPDATED]</p>

                                <h4>1. Course Access and Duration</h4>
                                <p>Upon successful enrollment and payment, you will gain access to the course materials for the duration specified in the course description. Access begins on the batch start date and continues through the course completion.</p>

                                <h4>2. Payment and Refund Policy</h4>
                                <p>[PLACEHOLDER] - Refund terms and conditions to be defined. Generally, refunds may be available within the first 7 days of course start, subject to specific conditions.</p>

                                <h4>3. Course Completion and Certification</h4>
                                <p>Course completion requirements will be communicated during the course. Certificates may be provided upon successful completion of all course requirements.</p>

                                <h4>4. Code of Conduct</h4>
                                <p>Students are expected to maintain respectful and professional conduct in all course interactions, including live sessions, forums, and group activities.</p>

                                <h4>5. Intellectual Property</h4>
                                <p>All course materials, including videos, slides, and assignments, are proprietary to TuneParams.ai and are for personal educational use only.</p>

                                <h4>6. Technical Requirements</h4>
                                <p>Students are responsible for ensuring they have the necessary technical requirements and stable internet connection to participate in online sessions.</p>

                                <p><em>Note: These terms are subject to updates. Full terms and conditions will be provided upon enrollment completion.</em></p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowTermsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
                    <div className="modal-content privacy-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Privacy Policy</h2>
                            <button className="modal-close" onClick={() => setShowPrivacyModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="privacy-content">
                                <h3>Privacy Policy</h3>
                                <p><strong>Effective Date:</strong> [TO BE UPDATED]</p>

                                <h4>1. Information We Collect</h4>
                                <p>We collect information necessary for course enrollment, including name, email address, payment information, and course progress data.</p>

                                <h4>2. How We Use Your Information</h4>
                                <p>Your information is used to provide course access, communicate course updates, process payments, and improve our educational services.</p>

                                <h4>3. Information Sharing</h4>
                                <p>[PLACEHOLDER] - We do not sell or share personal information with third parties except as necessary for course delivery and payment processing.</p>

                                <h4>4. Data Security</h4>
                                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

                                <h4>5. Your Rights</h4>
                                <p>You have the right to access, update, or delete your personal information. Contact us for any privacy-related requests.</p>

                                <h4>6. Contact Information</h4>
                                <p>For privacy-related questions, please contact us at [CONTACT EMAIL TO BE ADDED].</p>

                                <p><em>Note: This privacy policy is subject to updates. Full privacy policy will be provided upon enrollment completion.</em></p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowPrivacyModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayPalCheckout;
