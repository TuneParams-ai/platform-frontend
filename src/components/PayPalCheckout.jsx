import React, { useEffect, useRef, useState, useCallback } from 'react';

const PayPalCheckout = ({
    courseId,
    courseTitle,
    coursePrice,
    onSuccess,
    onError,
    onCancel,
    disabled = false
}) => {
    const paypalRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [paypalLoaded, setPaypalLoaded] = useState(false);

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

    const renderPayPalButton = useCallback(() => {
        if (paypalRef.current && window.paypal) {
            // Clear any existing PayPal button
            paypalRef.current.innerHTML = '';

            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: coursePrice.toString(),
                                currency_code: 'USD'
                            },
                            description: `Enrollment for ${courseTitle}`,
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
                                amount: coursePrice,
                                payerEmail: order.payer.email_address,
                                payerName: payerName,
                                transactionStatus: order.status,
                                timestamp: new Date().toISOString(),
                                // Add payment method details
                                paymentSource: paymentSource,
                                fundingSource: fundingSource,
                                // Add payer address if available
                                payerAddress: order.payer.address || null
                            });
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
    }, [coursePrice, courseTitle, courseId, onSuccess, onError, onCancel]);

    useEffect(() => {
        if (paypalLoaded && !disabled && coursePrice > 0) {
            renderPayPalButton();
        }
    }, [paypalLoaded, disabled, coursePrice, renderPayPalButton]);

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

    if (disabled || coursePrice <= 0) {
        return (
            <div className="paypal-disabled">
                <p>Payment not available for this course.</p>
            </div>
        );
    }

    return (
        <div className="paypal-checkout-container">
            <div className="payment-summary">
                <h4>Payment Summary</h4>
                <div className="payment-details">
                    <div className="payment-item">
                        <span>Course:</span>
                        <span>{courseTitle}</span>
                    </div>
                    <div className="payment-item total">
                        <span>Total:</span>
                        <span>${coursePrice}</span>
                    </div>
                </div>
            </div>
            <div
                ref={paypalRef}
                className="paypal-button-container"
                style={{ minHeight: '45px' }}
            />
            <div className="payment-security">
                <p>🔒 Secure payment powered by PayPal</p>
                <p>Your payment information is encrypted and secure</p>
            </div>
        </div>
    );
};

export default PayPalCheckout;
