// src/components/CouponInput.jsx
// Component for applying coupon codes during checkout
import React, { useState } from 'react';
import { validateAndApplyCoupon } from '../services/couponService';
import '../styles/coupon-input.css';

const CouponInput = ({
    userId,
    courseId,
    originalAmount,
    onCouponApplied,
    onCouponRemoved,
    disabled = false
}) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [showCouponInput, setShowCouponInput] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await validateAndApplyCoupon(
                couponCode.trim(),
                userId,
                courseId,
                originalAmount
            );

            if (result.valid) {
                setAppliedCoupon(result);
                setError('');
                setCouponCode('');
                // Notify parent component
                if (onCouponApplied) {
                    onCouponApplied(result);
                }
            } else {
                setError(result.error);
                setAppliedCoupon(null);
            }
        } catch (err) {
            setError('Failed to validate coupon code');
            setAppliedCoupon(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setError('');
        setCouponCode('');
        setShowCouponInput(false);
        if (onCouponRemoved) {
            onCouponRemoved();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleApplyCoupon();
        }
    };

    const formatDiscount = (coupon) => {
        if (coupon.discountType === 'percentage') {
            let text = `${coupon.discountValue}% off`;
            if (coupon.couponData?.maxDiscountAmount && coupon.discountAmount >= coupon.couponData.maxDiscountAmount) {
                text += ` (max $${coupon.couponData.maxDiscountAmount})`;
            }
            return text;
        } else {
            return `$${coupon.discountValue} off`;
        }
    };

    return (
        <div className="coupon-input-container">
            {!appliedCoupon ? (
                <>
                    {!showCouponInput ? (
                        <div className="coupon-toggle-section">
                            <button
                                type="button"
                                className="coupon-toggle-btn"
                                onClick={() => setShowCouponInput(true)}
                                disabled={disabled}
                            >
                                Have a coupon code?
                            </button>
                        </div>
                    ) : (
                        <div className="coupon-input-section">
                            <div className="coupon-input-header">
                                <h4>Enter your coupon code</h4>
                                <button
                                    type="button"
                                    className="coupon-close-btn"
                                    onClick={() => setShowCouponInput(false)}
                                    disabled={disabled || loading}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="coupon-input-group">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter coupon code"
                                    className="coupon-input"
                                    disabled={disabled || loading}
                                    maxLength={20}
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={disabled || loading || !couponCode.trim()}
                                    className="apply-coupon-btn"
                                >
                                    {loading ? 'Applying...' : 'Apply'}
                                </button>
                            </div>
                            {error && <div className="coupon-error">{error}</div>}
                        </div>
                    )}
                </>
            ) : (
                <div className="applied-coupon-section">
                    <div className="applied-coupon-info">
                        <div className="coupon-success">
                            <span className="success-icon">✅</span>
                            <div className="coupon-details">
                                <div className="coupon-code-applied">
                                    Code: <strong>{appliedCoupon.couponCode}</strong>
                                </div>
                                <div className="coupon-discount">
                                    {formatDiscount(appliedCoupon)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRemoveCoupon}
                            className="remove-coupon-btn"
                            disabled={disabled}
                            title="Remove coupon"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>Original Price:</span>
                            <span>${appliedCoupon.originalAmount.toFixed(2)}</span>
                        </div>
                        <div className="price-row discount-row">
                            <span>Discount ({formatDiscount(appliedCoupon)}):</span>
                            <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="price-row total-row">
                            <span><strong>Final Price:</strong></span>
                            <span><strong>${appliedCoupon.finalAmount.toFixed(2)}</strong></span>
                        </div>
                        {appliedCoupon.savings > 0 && (
                            <div className="savings-badge">
                                You save ${appliedCoupon.savings.toFixed(2)}!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponInput;
