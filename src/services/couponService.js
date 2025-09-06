// src/services/couponService.js
// Service for managing coupons and discount codes
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
    increment,
    addDoc,
    limit,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserProfile } from './userService';
import { findCourseById } from '../data/coursesData';

/**
 * Generates a unique coupon code
 * @param {string} prefix - Optional prefix for the coupon code
 * @returns {string} Generated coupon code
 */
const generateCouponCode = (prefix = '') => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return prefix ? `${prefix}${randomPart}${timestamp}` : `${randomPart}${timestamp}`;
};

/**
 * Creates a new coupon
 * @param {Object} couponData - Coupon details
 * @param {string} adminUserId - Admin user ID creating the coupon
 * @returns {Promise<Object>} Success/error response
 */
export const createCoupon = async (couponData, adminUserId) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        // Generate unique coupon code if not provided
        const couponCode = couponData.code || generateCouponCode(couponData.prefix || '');

        // Check if coupon code already exists
        const existingCouponQuery = query(
            collection(db, 'coupons'),
            where('code', '==', couponCode),
            limit(1)
        );
        const existingCoupons = await getDocs(existingCouponQuery);

        if (!existingCoupons.empty) {
            throw new Error('Coupon code already exists');
        }

        // Validate course if specified
        if (couponData.courseId) {
            const course = findCourseById(couponData.courseId);
            if (!course) {
                throw new Error(`Course not found: ${couponData.courseId}`);
            }
        }

        // Validate user if specified
        if (couponData.targetUserId) {
            const userProfile = await getUserProfile(couponData.targetUserId);
            if (!userProfile.success) {
                throw new Error(`Target user not found: ${couponData.targetUserId}`);
            }
        }

        // Validate discount data
        if (couponData.discountType === 'percentage' && (couponData.discountValue <= 0 || couponData.discountValue > 100)) {
            throw new Error('Percentage discount must be between 1 and 100');
        }
        if (couponData.discountType === 'fixed' && couponData.discountValue <= 0) {
            throw new Error('Fixed discount amount must be greater than 0');
        }

        const coupon = {
            // Basic coupon information
            code: couponCode,
            name: couponData.name || `Coupon ${couponCode}`,
            description: couponData.description || '',

            // Discount details
            discountType: couponData.discountType, // 'percentage' or 'fixed'
            discountValue: parseFloat(couponData.discountValue),
            maxDiscountAmount: couponData.maxDiscountAmount ? parseFloat(couponData.maxDiscountAmount) : null,
            minOrderAmount: couponData.minOrderAmount ? parseFloat(couponData.minOrderAmount) : null,

            // Usage restrictions
            targetType: couponData.targetType, // 'user_specific', 'course_specific', 'general'
            targetUserId: couponData.targetUserId || null,
            targetUserEmail: couponData.targetUserEmail || null,
            courseId: couponData.courseId || null,
            courseTitle: couponData.courseTitle || null,

            // Usage limits
            usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : null,
            usageLimitPerUser: couponData.usageLimitPerUser ? parseInt(couponData.usageLimitPerUser) : 1,
            usageCount: 0,

            // Validity period
            validFrom: couponData.validFrom ? new Date(couponData.validFrom) : new Date(),
            validUntil: couponData.validUntil ? new Date(couponData.validUntil) : null,

            // Status
            status: 'active', // 'active', 'inactive', 'expired'

            // Admin information
            createdBy: adminUserId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),

            // Usage tracking
            usageHistory: []
        };

        // Create coupon document
        const couponRef = await addDoc(collection(db, 'coupons'), coupon);

        console.log('Coupon created with ID:', couponRef.id);
        return {
            success: true,
            couponId: couponRef.id,
            couponCode: couponCode,
            couponData: coupon
        };

    } catch (error) {
        console.error('Error creating coupon:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Validates and applies a coupon to an order
 * @param {string} couponCode - Coupon code to validate
 * @param {string} userId - User ID attempting to use the coupon
 * @param {string} courseId - Course ID for the order
 * @param {number} orderAmount - Original order amount
 * @returns {Promise<Object>} Validation result and discount details
 */
export const validateAndApplyCoupon = async (couponCode, userId, courseId, orderAmount) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        // Find coupon by code
        const couponQuery = query(
            collection(db, 'coupons'),
            where('code', '==', couponCode.toUpperCase()),
            limit(1)
        );
        const couponSnapshot = await getDocs(couponQuery);

        if (couponSnapshot.empty) {
            return { valid: false, error: 'Invalid coupon code' };
        }

        const couponDoc = couponSnapshot.docs[0];
        const coupon = couponDoc.data();

        // Check if coupon is active
        if (coupon.status !== 'active') {
            return { valid: false, error: 'Coupon is not active' };
        }

        // Check validity period
        const now = new Date();
        if (coupon.validFrom && coupon.validFrom.toDate() > now) {
            return { valid: false, error: 'Coupon is not yet valid' };
        }
        if (coupon.validUntil && coupon.validUntil.toDate() < now) {
            return { valid: false, error: 'Coupon has expired' };
        }

        // Check user-specific restrictions
        if (coupon.targetType === 'user_specific' && coupon.targetUserId !== userId) {
            return { valid: false, error: 'This coupon is not valid for your account' };
        }

        // Check course-specific restrictions
        if (coupon.targetType === 'course_specific' && coupon.courseId !== courseId) {
            return { valid: false, error: 'This coupon is not valid for this course' };
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            return {
                valid: false,
                error: `Minimum order amount of $${coupon.minOrderAmount} required`
            };
        }

        // Check usage limits
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { valid: false, error: 'Coupon usage limit exceeded' };
        }

        // Check per-user usage limit
        const userUsageCount = coupon.usageHistory.filter(usage => usage.userId === userId).length;
        if (coupon.usageLimitPerUser && userUsageCount >= coupon.usageLimitPerUser) {
            return { valid: false, error: 'You have already used this coupon the maximum number of times' };
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            // Apply maximum discount cap if set
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = Math.min(coupon.discountValue, orderAmount);
        }

        const finalAmount = Math.max(0, orderAmount - discountAmount);

        return {
            valid: true,
            couponId: couponDoc.id,
            couponCode: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: discountAmount,
            originalAmount: orderAmount,
            finalAmount: finalAmount,
            savings: discountAmount,
            couponData: coupon
        };

    } catch (error) {
        console.error('Error validating coupon:', error);
        return { valid: false, error: error.message };
    }
};

/**
 * Records coupon usage after successful payment
 * @param {string} couponId - Coupon document ID
 * @param {string} userId - User ID who used the coupon
 * @param {string} courseId - Course ID for the order
 * @param {Object} usageData - Additional usage data
 * @returns {Promise<Object>} Success/error response
 */
export const recordCouponUsage = async (couponId, userId, courseId, usageData) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const couponRef = doc(db, 'coupons', couponId);
        const couponDoc = await getDoc(couponRef);

        if (!couponDoc.exists()) {
            throw new Error('Coupon not found');
        }

        const coupon = couponDoc.data();

        // Create usage record
        const usageRecord = {
            userId: userId,
            courseId: courseId,
            usedAt: new Date(),
            orderAmount: usageData.orderAmount,
            discountAmount: usageData.discountAmount,
            finalAmount: usageData.finalAmount,
            paymentId: usageData.paymentId || null,
            orderId: usageData.orderId || null
        };

        // Update coupon document
        await updateDoc(couponRef, {
            usageCount: increment(1),
            usageHistory: [...(coupon.usageHistory || []), usageRecord],
            updatedAt: serverTimestamp()
        });

        // Create separate usage record for detailed tracking
        const usageLogRef = await addDoc(collection(db, 'coupon_usage'), {
            couponId: couponId,
            couponCode: coupon.code,
            ...usageRecord,
            createdAt: serverTimestamp()
        });

        console.log('Coupon usage recorded:', usageLogRef.id);
        return { success: true, usageLogId: usageLogRef.id };

    } catch (error) {
        console.error('Error recording coupon usage:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gets all coupons (admin function)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} List of coupons
 */
export const getAllCoupons = async (filters = {}) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        let couponQuery = collection(db, 'coupons');

        // Apply filters
        if (filters.status) {
            couponQuery = query(couponQuery, where('status', '==', filters.status));
        }
        if (filters.targetType) {
            couponQuery = query(couponQuery, where('targetType', '==', filters.targetType));
        }
        if (filters.courseId) {
            couponQuery = query(couponQuery, where('courseId', '==', filters.courseId));
        }

        // Order by creation date (newest first)
        couponQuery = query(couponQuery, orderBy('createdAt', 'desc'));

        const couponSnapshot = await getDocs(couponQuery);
        const coupons = [];

        couponSnapshot.forEach((doc) => {
            coupons.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, coupons };

    } catch (error) {
        console.error('Error getting all coupons:', error);
        return { success: false, error: error.message, coupons: [] };
    }
};

/**
 * Gets coupons available for a specific user
 * @param {string} userId - User ID
 * @param {string} courseId - Optional course ID to filter by
 * @returns {Promise<Object>} List of available coupons
 */
export const getUserAvailableCoupons = async (userId, courseId = null) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const now = new Date();
        const coupons = [];

        // Get general coupons
        const generalQuery = query(
            collection(db, 'coupons'),
            where('targetType', '==', 'general'),
            where('status', '==', 'active')
        );
        const generalSnapshot = await getDocs(generalQuery);

        // Get user-specific coupons
        const userSpecificQuery = query(
            collection(db, 'coupons'),
            where('targetType', '==', 'user_specific'),
            where('targetUserId', '==', userId),
            where('status', '==', 'active')
        );
        const userSpecificSnapshot = await getDocs(userSpecificQuery);

        // Get course-specific coupons if courseId provided
        let courseSpecificSnapshot = null;
        if (courseId) {
            const courseSpecificQuery = query(
                collection(db, 'coupons'),
                where('targetType', '==', 'course_specific'),
                where('courseId', '==', courseId),
                where('status', '==', 'active')
            );
            courseSpecificSnapshot = await getDocs(courseSpecificQuery);
        }

        // Process all coupon types
        [generalSnapshot, userSpecificSnapshot, courseSpecificSnapshot].forEach(snapshot => {
            if (snapshot) {
                snapshot.forEach((doc) => {
                    const coupon = { id: doc.id, ...doc.data() };

                    // Check validity period
                    if (coupon.validFrom && coupon.validFrom.toDate() > now) return;
                    if (coupon.validUntil && coupon.validUntil.toDate() < now) return;

                    // Check usage limits
                    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return;

                    // Check per-user usage limit
                    const userUsageCount = coupon.usageHistory.filter(usage => usage.userId === userId).length;
                    if (coupon.usageLimitPerUser && userUsageCount >= coupon.usageLimitPerUser) return;

                    coupons.push(coupon);
                });
            }
        });

        return { success: true, coupons };

    } catch (error) {
        console.error('Error getting user available coupons:', error);
        return { success: false, error: error.message, coupons: [] };
    }
};

/**
 * Updates coupon status
 * @param {string} couponId - Coupon document ID
 * @param {string} status - New status ('active', 'inactive', 'expired')
 * @param {string} adminUserId - Admin user ID making the change
 * @returns {Promise<Object>} Success/error response
 */
export const updateCouponStatus = async (couponId, status, adminUserId) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const couponRef = doc(db, 'coupons', couponId);

        await updateDoc(couponRef, {
            status: status,
            updatedAt: serverTimestamp(),
            lastModifiedBy: adminUserId
        });

        return { success: true };

    } catch (error) {
        console.error('Error updating coupon status:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gets coupon usage statistics
 * @param {string} couponId - Optional specific coupon ID
 * @returns {Promise<Object>} Usage statistics
 */
export const getCouponUsageStats = async (couponId = null) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        let usageQuery = collection(db, 'coupon_usage');

        if (couponId) {
            usageQuery = query(usageQuery, where('couponId', '==', couponId));
        }

        usageQuery = query(usageQuery, orderBy('createdAt', 'desc'));

        const usageSnapshot = await getDocs(usageQuery);
        const usageRecords = [];
        let totalDiscount = 0;
        let totalOrders = 0;

        usageSnapshot.forEach((doc) => {
            const usage = { id: doc.id, ...doc.data() };
            usageRecords.push(usage);
            totalDiscount += usage.discountAmount || 0;
            totalOrders += usage.orderAmount || 0;
        });

        return {
            success: true,
            stats: {
                totalUsage: usageRecords.length,
                totalDiscount: totalDiscount,
                totalOrders: totalOrders,
                averageDiscount: usageRecords.length > 0 ? totalDiscount / usageRecords.length : 0,
                usageRecords: usageRecords
            }
        };

    } catch (error) {
        console.error('Error getting coupon usage stats:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Deletes a coupon (admin function)
 * @param {string} couponId - Coupon document ID
 * @param {string} adminUserId - Admin user ID performing the deletion
 * @returns {Promise<Object>} Success/error response
 */
export const deleteCoupon = async (couponId, adminUserId) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const couponRef = doc(db, 'coupons', couponId);
        const couponDoc = await getDoc(couponRef);

        if (!couponDoc.exists()) {
            throw new Error('Coupon not found');
        }

        const coupon = couponDoc.data();

        // Check if coupon has been used
        if (coupon.usageCount > 0) {
            // Instead of deleting, mark as inactive
            await updateDoc(couponRef, {
                status: 'inactive',
                deletedAt: serverTimestamp(),
                deletedBy: adminUserId,
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                message: 'Coupon marked as inactive (cannot delete used coupons)'
            };
        } else {
            // Safe to delete unused coupon
            await deleteDoc(couponRef);
            return {
                success: true,
                message: 'Coupon deleted successfully'
            };
        }

    } catch (error) {
        console.error('Error deleting coupon:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Gets coupon by code (for quick lookup)
 * @param {string} couponCode - Coupon code
 * @returns {Promise<Object>} Coupon data or null
 */
export const getCouponByCode = async (couponCode) => {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }

        const couponQuery = query(
            collection(db, 'coupons'),
            where('code', '==', couponCode.toUpperCase()),
            limit(1)
        );
        const couponSnapshot = await getDocs(couponQuery);

        if (couponSnapshot.empty) {
            return { success: false, error: 'Coupon not found' };
        }

        const couponDoc = couponSnapshot.docs[0];
        return {
            success: true,
            coupon: {
                id: couponDoc.id,
                ...couponDoc.data()
            }
        };

    } catch (error) {
        console.error('Error getting coupon by code:', error);
        return { success: false, error: error.message };
    }
};
