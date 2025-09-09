// src/hooks/useCoupons.js
// Custom hook for managing coupon-related functionality
import { useState, useEffect } from 'react';
import {
    validateAndApplyCoupon,
    getUserAvailableCoupons,
    recordCouponUsage
} from '../services/couponService';

export const useCoupons = (userId, courseId, orderAmount) => {
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load available coupons for user
    useEffect(() => {
        if (userId && courseId) {
            loadAvailableCoupons();
        }
    }, [userId, courseId]);

    const loadAvailableCoupons = async () => {
        try {
            const result = await getUserAvailableCoupons(userId, courseId);
            if (result.success) {
                setAvailableCoupons(result.coupons);
            }
        } catch (err) {
            console.error('Failed to load available coupons:', err);
        }
    };

    const applyCoupon = async (couponCode) => {
        setLoading(true);
        setError('');

        try {
            const result = await validateAndApplyCoupon(
                couponCode,
                userId,
                courseId,
                orderAmount
            );

            if (result.valid) {
                setAppliedCoupon(result);
                return { success: true, coupon: result };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Failed to validate coupon';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setError('');
    };

    const recordUsage = async (paymentData) => {
        if (!appliedCoupon) return { success: true };

        try {
            const result = await recordCouponUsage(
                appliedCoupon.couponId,
                userId,
                courseId,
                paymentData
            );
            return result;
        } catch (err) {
            console.error('Failed to record coupon usage:', err);
            return { success: false, error: err.message };
        }
    };

    const getFinalAmount = () => {
        return appliedCoupon ? appliedCoupon.finalAmount : orderAmount;
    };

    const getDiscountAmount = () => {
        return appliedCoupon ? appliedCoupon.discountAmount : 0;
    };

    const getSavings = () => {
        return appliedCoupon ? appliedCoupon.savings : 0;
    };

    return {
        appliedCoupon,
        availableCoupons,
        loading,
        error,
        applyCoupon,
        removeCoupon,
        recordUsage,
        getFinalAmount,
        getDiscountAmount,
        getSavings,
        refreshAvailableCoupons: loadAvailableCoupons
    };
};
