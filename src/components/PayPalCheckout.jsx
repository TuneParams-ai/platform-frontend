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
            console.warn('PayPal Client ID not configured');
            setIsLoading(false);
            return;
        }

        console.log('Loading PayPal SDK with Client ID:', PAYPAL_CLIENT_ID ? PAYPAL_CLIENT_ID.substring(0, 10) + '...' : 'undefined');

        // Load PayPal SDK
        const loadPayPalScript = () => {
            if (window.paypal) {
                console.log('PayPal SDK already loaded');
                setPaypalLoaded(true);
                setIsLoading(false);
                return;
            }

            const script = document.createElement('script');
            const environment = process.env.REACT_APP_PAYPAL_ENVIRONMENT || 'sandbox';

            // Enable credit cards, disable venmo and paylater
            script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&enable-funding=card&disable-funding=venmo,paylater`;
            script.async = true;

            console.log('Loading PayPal SDK:', environment, 'mode');

            script.onload = () => {
                console.log('✅ PayPal SDK loaded successfully');
                if (window.paypal) {
                    setPaypalLoaded(true);
                } else {
                    console.error('❌ PayPal SDK loaded but object not available');
                }
                setIsLoading(false);
            }; script.onerror = (error) => {
                console.error('❌ Failed to load PayPal SDK:', error);

                // Test if the URL is accessible to provide specific error messages
                fetch(script.src, { method: 'HEAD' })
                    .then(response => {
                        if (response.status === 400) {
                            console.error('❌ Invalid PayPal Client ID');
                            alert('Invalid PayPal Client ID. Please contact support.');
                        } else if (response.status === 404) {
                            console.error('❌ PayPal SDK not found');
                            alert('PayPal SDK not found. Please try refreshing the page.');
                        } else if (response.ok) {
                            alert('PayPal SDK failed to load. Please refresh the page and try again.');
                        }
                    })
                    .catch(fetchError => {
                        console.error('❌ Network error:', fetchError);
                        alert('Network error loading PayPal. Please check your connection.');
                    });

                setIsLoading(false);
                if (onError) {
                    onError(new Error('PayPal SDK failed to load. Please refresh the page and try again.'));
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
                        batchInfo: result.batchInfo,
                        enrollmentComplete: true // Flag to prevent duplicate processing
                    });
                }
            } else {
                if (onError) {
                    onError(new Error(result.error));
                }
            }
        } catch (error) {
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
                    console.log('Creating PayPal order for:', courseTitle, '$' + finalPrice);

                    if (!finalPrice || finalPrice <= 0) {
                        console.error('❌ Invalid payment amount:', finalPrice);
                        alert('Invalid payment amount. Please refresh and try again.');
                        throw new Error('Invalid payment amount');
                    }

                    if (!user?.uid) {
                        console.error('❌ User not authenticated');
                        alert('Please log in to continue with payment.');
                        throw new Error('User not authenticated');
                    }

                    const orderData = {
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
                            user_action: 'PAY_NOW',
                            shipping_preference: 'NO_SHIPPING'
                        }
                    };

                    console.log('Order data being sent to PayPal:', orderData);

                    return actions.order.create(orderData).then(orderId => {
                        console.log('✅ PayPal order created:', orderId);
                        return orderId;
                    }).catch(error => {
                        console.error('❌ Failed to create PayPal order:', error);

                        let errorMessage = 'Failed to create payment order';

                        // Handle specific PayPal error codes
                        if (error.message && error.message.includes('422')) {
                            errorMessage = 'PayPal Client ID invalid. Please contact support.';
                        } else if (error.message && error.message.includes('401')) {
                            errorMessage = 'PayPal authentication failed. Please contact support.';
                        } else if (error.message && error.message.includes('403')) {
                            errorMessage = 'PayPal access denied. Please contact support.';
                        } else if (error.message) {
                            errorMessage = `PayPal error: ${error.message}`;
                        }

                        alert(errorMessage);
                        throw error;
                    });
                },
                onApprove: async (data, actions) => {
                    console.log('Processing payment approval...');

                    try {
                        const order = await actions.order.capture();
                        console.log('✅ Payment captured successfully');

                        // Validate payment structure
                        if (!order?.purchase_units?.[0]?.payments?.captures?.[0]) {
                            console.error('❌ Invalid payment structure');
                            throw new Error('Payment capture failed. Please contact support.');
                        }

                        const capture = order.purchase_units[0].payments.captures[0];
                        if (capture.status !== 'COMPLETED') {
                            console.error('❌ Payment not completed:', capture.status);
                            throw new Error(`Payment ${capture.status.toLowerCase()}. Please try again.`);
                        }

                        console.log('✅ Payment completed successfully');

                        // Call success handler with payment details
                        if (onSuccess) {
                            const payerName = order.payer.name
                                ? `${order.payer.name.given_name || ''} ${order.payer.name.surname || ''}`.trim()
                                : 'Student';

                            const successData = {
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
                                paymentSource: order.purchase_units[0].payments.captures[0].payment_source || {},
                                fundingSource: order.purchase_units[0].payments.captures[0].funding_source || null,
                                payerAddress: order.payer.address || null,
                                // Add terms acceptance data
                                termsAccepted: termsAccepted,
                                termsAcceptedAt: new Date().toISOString(),
                                // Add coupon data if applied
                                appliedCoupon: appliedCoupon
                            };

                            console.log('Calling success handler with data:', successData);

                            try {
                                onSuccess(successData);
                                console.log('✅ Success handler called successfully');
                            } catch (successError) {
                                console.error('❌ Error in success handler:', successError);
                                alert(`Payment successful but enrollment failed: ${successError.message}. Please contact support with Order ID: ${order.id}`);
                                return;
                            }

                            // Record coupon usage if coupon was applied
                            if (appliedCoupon) {
                                try {
                                    const couponUsageResult = await recordCouponUsage(appliedCoupon.couponId, user?.uid, courseId, {
                                        orderAmount: originalPrice,
                                        discountAmount: appliedCoupon.discountAmount,
                                        finalAmount: finalPrice,
                                        paymentId: order.purchase_units[0].payments.captures[0].id,
                                        orderId: order.id
                                    });

                                    if (couponUsageResult.success) {
                                        console.log('Coupon usage recorded successfully');
                                    } else {
                                        console.error('Failed to record coupon usage:', couponUsageResult.error);
                                    }
                                } catch (couponError) {
                                    console.error('Error recording coupon usage:', couponError);
                                    // Don't fail the payment for coupon recording errors
                                }
                            }
                        } else {
                            console.error('❌ No success handler provided');
                            alert('Payment successful but no success handler. Please contact support.');
                            return;
                        }
                    } catch (error) {
                        console.error('Payment processing error:', error);

                        let errorMessage = 'Payment processing failed. Please try again.';

                        // Handle specific error types
                        if (error.message && error.message.includes('capture')) {
                            errorMessage = 'Payment capture failed. Your card may have been charged but enrollment was not completed. Please contact support.';
                        } else if (error.message && error.message.includes('network')) {
                            errorMessage = 'Network error during payment processing. Please check your connection and try again.';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }

                        const enhancedError = new Error(errorMessage);
                        enhancedError.originalError = error;

                        if (onError) {
                            onError(enhancedError);
                        }
                    }
                },
                onError: (err) => {
                    console.error('PayPal payment error:', err);
                    let errorMessage = 'Payment failed. Please try again.';

                    // Provide more specific error messages based on error type
                    if (err.name === 'VALIDATION_ERROR') {
                        errorMessage = 'Payment validation failed. Please check your payment information and try again.';
                    } else if (err.name === 'INSTRUMENT_DECLINED') {
                        errorMessage = 'Your payment method was declined. Please try a different card or payment method.';
                    } else if (err.name === 'PAYER_ACTION_REQUIRED') {
                        errorMessage = 'Additional verification required. Please complete the payment process.';
                    } else if (err.name === 'UNPROCESSABLE_ENTITY') {
                        errorMessage = 'Payment could not be processed. Please verify your payment details.';
                    } else if (err.message && err.message.includes('network')) {
                        errorMessage = 'Network error. Please check your connection and try again.';
                    }

                    const enhancedError = new Error(errorMessage);
                    enhancedError.originalError = err;

                    if (onError) {
                        onError(enhancedError);
                    }
                },
                onCancel: (data) => {
                    if (onCancel) {
                        onCancel(data);
                    }
                },
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'pay',
                    height: 45,
                    tagline: false
                }
                // Remove fundingSource restriction to allow all payment methods including credit cards
            }).render(paypalRef.current).then(() => {
                console.log('✅ PayPal Buttons rendered successfully');
            }).catch((renderError) => {
                console.error('❌ Failed to render PayPal Buttons:', renderError);
                if (onError) {
                    onError(new Error('Failed to load payment options. Please refresh the page and try again.'));
                }
            });
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
                    Missing REACT_APP_PAYPAL_CLIENT_ID environment variable.
                </p>
                <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.8 }}>
                    Please set up your PayPal Client ID to enable payments.
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
                                <h3>Terms and Conditions for Foundations to Frontiers of AI Course Offered by TuneParams</h3>
                                <p><strong>Effective Date:</strong> September 1, 2025</p>

                                <p>These Terms and Conditions ("Agreement") govern your registration and participation in the AI Online Live Course (the "Course") provided by TuneParams ("we," "us," "our"). By registering for the Course, you agree to be legally bound by this Agreement.</p>

                                <h4>1. Acceptance of Terms</h4>
                                <p>By accessing or using TuneParams.ai's platform, services, or content, users acknowledge that they have read, understood, and agree to be bound by these Terms and Conditions. If users do not agree with any part of these Terms, they must refrain from using the platform.</p>

                                <h4>2. Fees and Payment</h4>
                                <ul>
                                    <li>Full payment of the advertised course fee is required at registration.</li>
                                    <li>Accepted payment methods: PayPal, debit card, credit card, or other methods introduced by us.</li>
                                    <li>All fees are in USD unless otherwise noted. Currency conversion, bank, or transaction fees are your responsibility.</li>
                                    <li>Access to the Course is granted only after successful payment.</li>
                                    <li>Fees are non-transferable and non-refundable except as outlined in Section 7 (Cancellations and Refunds).</li>
                                    <li>If payment is disputed, reversed, or charged back, your enrollment and access will be suspended immediately. We reserve the right to pursue remedies for fraudulent chargebacks.</li>
                                </ul>

                                <h4>3. Eligibility</h4>
                                <p>To register, you must:</p>
                                <ul>
                                    <li>Be at least 16 years of age. Minors must provide written parental/guardian consent.</li>
                                    <li>Have access to a functioning computer, microphone, camera, and reliable internet.</li>
                                    <li>Be proficient in English (spoken and written).</li>
                                    <li>Ensure participation is lawful under the regulations of your country of residence.</li>
                                </ul>

                                <h4>4. User Obligations</h4>
                                <p>Users agree to provide accurate, complete, and current information during registration and throughout their use of the platform. Users are responsible for maintaining the confidentiality of their login credentials and for all activities conducted under their account. Misuse, fraudulent activity, or sharing of accounts is strictly prohibited.</p>

                                <h4>5. Roles and Access</h4>
                                <ul>
                                    <li>Users may be Students, Instructors, or Administrators, each with specific access rights.</li>
                                    <li>Instructors may not promise specific outcomes, certifications, or employment opportunities.</li>
                                    <li>Administrators retain final authority on account management, course access, refunds, and dispute resolution.</li>
                                </ul>

                                <h4>6. Intellectual Property</h4>
                                <ul>
                                    <li>All materials (videos, slides, assignments, recordings, notes, graphics, software, and others) are the exclusive property of TuneParams or its licensors.</li>
                                    <li>You are granted a limited, personal, non-transferable license to access content only during your enrollment.</li>
                                    <li>You may not:
                                        <ul>
                                            <li>Copy, reproduce, share, resell, or distribute any material.</li>
                                            <li>Record live sessions or create derivative works.</li>
                                            <li>Use the content for commercial, non-commercial, educational, or research purposes outside this Course.</li>
                                        </ul>
                                    </li>
                                    <li>Unauthorized use may result in immediate removal without refund and potential legal action.</li>
                                </ul>

                                <h4>7. Intellectual Property</h4>
                                <p>All content, including but not limited to text, software, code, graphics, images, trademarks, service marks, and logos provided on TuneParams.ai is the exclusive property of TuneParams.ai or its licensors. Unauthorized use, reproduction, modification, distribution, or exploitation of this content without express permission is prohibited.</p>

                                <h4>8. Technology Requirements</h4>
                                <ul>
                                    <li>You are responsible for ensuring your equipment and internet meet minimum requirements.</li>
                                    <li>Installing required apps/software, platform updates, or compatibility issues on your side do not qualify for refunds.</li>
                                    <li>Missed sessions due to personal or technical issues are your responsibility. Recordings, if available, may substitute but are not guaranteed.</li>
                                </ul>

                                <h4>9. Cancellations and Refunds</h4>
                                <p><strong>Student Cancellations:</strong></p>
                                <ul>
                                    <li>Full (100%) refund within 7 calendar days of the official course start date, provided you have not attended more than one (1) live session.</li>
                                    <li>No refunds after 7 days or if more than one session has been attended.</li>
                                </ul>
                                <p><strong>Provider Cancellations:</strong></p>
                                <ul>
                                    <li>If canceled before start: full refund.</li>
                                    <li>If canceled after start:
                                        <ul>
                                            <li>Less than 60% delivered → 100% refund.</li>
                                            <li>60% or more delivered → 50% refund.</li>
                                        </ul>
                                    </li>
                                </ul>
                                <p><strong>Partial Cancellations / Rescheduling:</strong></p>
                                <ul>
                                    <li>Instructor substitutions, schedule adjustments, or rescheduling do not entitle refunds.</li>
                                    <li>Postponed sessions will be rescheduled without additional cost.</li>
                                </ul>

                                <h4>10. Termination of Access</h4>
                                <p>TuneParams.ai reserves the right to suspend or terminate user accounts or restrict access to services at its sole discretion, without prior notice, if users violate these Terms, engage in unlawful activity, or compromise the platform's integrity. Users may also terminate their accounts by following the platform's account deletion procedures.</p>

                                <h4>11. Community Forums, Reviews, and Communication</h4>
                                <ul>
                                    <li>Forums and community spaces are for educational discussion only. Prohibited uses include spam, illegal content, and copyright infringement.</li>
                                    <li>We reserve the right to remove posts, suspend access, or ban users.</li>
                                    <li>Reviews must be from verified students and must be respectful, accurate, and relevant. We may edit or remove reviews that violate these conditions.</li>
                                    <li>By submitting reviews or feedback, you grant us the right to display them, including for promotional purposes.</li>
                                    <li>You consent to receive service-related communications (confirmations, updates, receipts). Marketing communications require opt-in.</li>
                                </ul>

                                <h4>12. Platform Availability and Technical Limitations</h4>
                                <ul>
                                    <li>We do not guarantee uninterrupted or error-free operation of the platform.</li>
                                    <li>Temporary downtime may occur due to maintenance, upgrades, or external factors.</li>
                                    <li>We are not liable for outages of third-party services (Zoom, PayPal, Firebase, EmailJS, etc.).</li>
                                </ul>

                                <h4>13. Data Protection and Privacy</h4>
                                <p>TuneParams.ai collects and processes personal data in accordance with its Privacy Policy, which forms an integral part of these Terms. We employ reasonable safeguards to protect user data but cannot guarantee absolute security. Users are responsible for ensuring their devices and networks are secure when accessing the platform.</p>

                                <h4>14. Limitation of Liability</h4>
                                <ul>
                                    <li>We make no guarantees regarding outcomes (employment, certification, skills, or opportunities).</li>
                                    <li>We are not liable for technical issues, missed sessions, or indirect damages (income loss, reputation harm, or opportunities).</li>
                                    <li>Our maximum liability is limited to the total course fee paid.</li>
                                </ul>

                                <h4>15. Certificates</h4>
                                <ul>
                                    <li>Certificates are awarded only upon:
                                        <ul>
                                            <li>Attending at least 95% of sessions.</li>
                                            <li>Completing all required assignments and assessments.</li>
                                        </ul>
                                    </li>
                                    <li>Certificates are digital only.</li>
                                    <li>Certificates may be revoked in cases of academic dishonesty or issuance error.</li>
                                </ul>

                                <h4>16. Third-Party Links and Content</h4>
                                <p>The platform may include links to external websites or resources. TuneParams.ai is not responsible for the content, accuracy, or practices of third-party sites. Accessing third-party content is at the user's own risk, and users are encouraged to review the respective terms and policies of such sites.</p>

                                <h4>17. Governing Law and Jurisdiction</h4>
                                <ul>
                                    <li>This Agreement is governed by the laws of the United States of America.</li>
                                    <li>Disputes are subject to the exclusive jurisdiction of U.S. courts unless local law requires otherwise.</li>
                                </ul>

                                <h4>18. Data Privacy and Confidentiality</h4>
                                <ul>
                                    <li>We collect necessary personal data (name, email, payment details, assignments, attendance, and communications).</li>
                                    <li>Data is used to manage enrollment, deliver the Course, issue certificates, and provide support.</li>
                                    <li>Session recordings may include your participation. Enrollment constitutes consent.</li>
                                    <li>We do not sell or rent your data. Data may be shared with trusted service providers under confidentiality agreements or with authorities if required by law.</li>
                                    <li>Student submissions may be used anonymously for academic, research, or promotional purposes unless you opt out in writing.</li>
                                    <li>We comply with applicable data privacy laws (including GDPR/CCPA principles).</li>
                                </ul>

                                <h4>19. Dispute Resolution</h4>
                                <p>Any disputes arising out of or relating to these Terms or the use of TuneParams.ai services shall first be attempted to be resolved amicably through informal negotiations. If unresolved, disputes shall be subject to binding arbitration under the rules of the American Arbitration Association, with the place of arbitration being Dallas, Texas. Users agree to waive any right to a jury trial or participation in class action lawsuits.</p>

                                <h4>20. Entire Agreement</h4>
                                <ul>
                                    <li>This Agreement constitutes the full understanding between you and TuneParams and supersedes all prior communications.</li>
                                    <li>If any provision is deemed invalid, the remaining provisions remain enforceable.</li>
                                </ul>

                                <h4>21. Instructor Status and Disclaimer</h4>
                                <ul>
                                    <li>Instructors, mentors, guest speakers, or teaching assistants may participate on a voluntary basis.</li>
                                    <li>Such individuals are not employees, contractors, or representatives of TuneParams.</li>
                                    <li>No agency, partnership, or employment relationship is created.</li>
                                </ul>

                                <h4>22. Professional Disclaimer and Risk Acknowledgment</h4>
                                <ul>
                                    <li>The Course is educational only and does not constitute professional, legal, medical, financial, or career advice.</li>
                                    <li>No guarantees of results, employment, or success are made.</li>
                                    <li>You are solely responsible for how you apply the information and skills learned.</li>
                                    <li>By enrolling, you assume all associated risks.</li>
                                </ul>

                                <p><strong>By completing your registration, you confirm that you have read, understood, and agreed to these Terms and Conditions.</strong></p>
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
