// src/services/reviewService.js
// Service for handling course reviews
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where,
    limit as qLimit,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { checkCourseAccess } from './paymentService';
import { getUserProfile } from './userService';

const REVIEWS_COLLECTION = 'course_reviews';

export const addOrUpdateReview = async ({
    userId,
    userName,
    userEmail,
    userPhotoURL,
    courseId,
    courseTitle,
    rating,
    comment,
}) => {
    try {
        if (!db) throw new Error('Firestore not initialized');
        if (!userId) throw new Error('User not authenticated');
        if (!courseId) throw new Error('Course ID required');
        const r = Number(rating);
        if (!Number.isFinite(r) || r < 1 || r > 5) throw new Error('Rating must be between 1 and 5');
        const c = (comment || '').trim();
        if (c.length === 0) throw new Error('Comment is required');
        if (c.length > 2000) throw new Error('Comment too long (max 2000 characters)');

        // Use the userEmail passed directly from the component
        // If not provided, fallback to fetching from user profile
        let finalUserEmail = userEmail;
        if (!finalUserEmail) {
            const userProfile = await getUserProfile(userId);
            finalUserEmail = userProfile.success ? userProfile.userData?.email : null;
        }

        // Ensure we have a valid email
        if (!finalUserEmail) {
            throw new Error('Unable to determine user email. Please ensure you are logged in properly.');
        }

        // Determine verified flag by checking enrollment
        const access = await checkCourseAccess(userId, courseId);
        const verified = !!access?.hasAccess;

        // Use deterministic doc id to keep one review per user per course
        const reviewId = `${courseId}_${userId}`;
        const ref = doc(db, REVIEWS_COLLECTION, reviewId);

        const existing = await getDoc(ref);
        const nowFields = existing.exists()
            ? { updatedAt: serverTimestamp() }
            : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

        await setDoc(
            ref,
            {
                userId,
                userEmail: finalUserEmail,
                userName,
                userPhotoURL: userPhotoURL || '',
                courseId,
                courseTitle,
                rating: r,
                comment: c,
                verified,
                ...nowFields,
            },
            { merge: true }
        );

        return { success: true, reviewId };
    } catch (error) {
        console.error('Error adding/updating review:', error);
        return { success: false, error: error.message };
    }
};

export const getCourseReviews = async (courseId, { limit = 20 } = {}) => {
    try {
        if (!db) throw new Error('Firestore not initialized');

        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('courseId', '==', courseId),
            orderBy('createdAt', 'desc'),
            qLimit(limit)
        );
        const snap = await getDocs(q);
        const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        return { success: true, reviews };
    } catch (error) {
        console.error('Error fetching course reviews:', error);
        return { success: false, error: error.message, reviews: [] };
    }
};

export const getRecentReviews = async ({ limit = 6 } = {}) => {
    try {
        if (!db) throw new Error('Firestore not initialized');
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            orderBy('createdAt', 'desc'),
            qLimit(limit)
        );
        const snap = await getDocs(q);
        const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return { success: true, reviews };
    } catch (error) {
        console.error('Error fetching recent reviews:', error);
        return { success: false, error: error.message, reviews: [] };
    }
};

export const getUserReviewForCourse = async (userId, courseId) => {
    try {
        if (!db) throw new Error('Firestore not initialized');
        const ref = doc(db, REVIEWS_COLLECTION, `${courseId}_${userId}`);
        const snap = await getDoc(ref);
        if (snap.exists()) return { success: true, review: { id: snap.id, ...snap.data() } };
        return { success: true, review: null };
    } catch (error) {
        console.error('Error getting user review:', error);
        return { success: false, error: error.message, review: null };
    }
};

export const deleteReview = async (courseId, userId) => {
    try {
        if (!db) throw new Error('Firestore not initialized');
        const ref = doc(db, REVIEWS_COLLECTION, `${courseId}_${userId}`);
        await deleteDoc(ref);
        return { success: true };
    } catch (error) {
        console.error('Error deleting review:', error);
        return { success: false, error: error.message };
    }
};

// Admin function to delete any review by review ID
export const deleteReviewByIdAsAdmin = async (reviewId) => {
    try {
        if (!db) throw new Error('Firestore not initialized');
        const ref = doc(db, REVIEWS_COLLECTION, reviewId);
        await deleteDoc(ref);
        return { success: true };
    } catch (error) {
        console.error('Error deleting review as admin:', error);
        return { success: false, error: error.message };
    }
};

// Optional: real-time subscription helpers
export const subscribeToCourseReviews = (courseId, callback, { limit = 20 } = {}) => {
    if (!db) {
        console.warn('Firestore not initialized, returning empty subscription');
        callback({ reviews: [], error: 'Firestore not initialized' });
        return () => { };
    }

    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('courseId', '==', courseId),
            orderBy('createdAt', 'desc'),
            qLimit(limit)
        );

        return onSnapshot(
            q,
            (snap) => {
                const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                callback({ reviews: items, error: null });
            },
            (err) => {
                console.error('Reviews subscription error:', err);
                // Provide more detailed error information
                let errorMessage = err.message;
                if (err.code === 'permission-denied') {
                    errorMessage = 'Permission denied accessing reviews. This might be a Firebase configuration issue.';
                } else if (err.code === 'unavailable') {
                    errorMessage = 'Firebase service temporarily unavailable. Please try again.';
                }
                callback({ reviews: [], error: errorMessage })
            }
        );
    } catch (error) {
        console.error('Error setting up reviews subscription:', error);
        callback({ reviews: [], error: error.message });
        return () => { };
    }
};

export const subscribeToRecentReviews = (callback, { limit = 6 } = {}) => {
    if (!db) {
        console.warn('Firestore not initialized, returning empty subscription');
        callback({ reviews: [], error: 'Firestore not initialized' });
        return () => { };
    }

    try {
        const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'), qLimit(limit));

        return onSnapshot(
            q,
            (snap) => {
                const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                callback({ reviews: items, error: null });
            },
            (err) => {
                console.error('Recent reviews subscription error:', err);
                // Provide more detailed error information
                let errorMessage = err.message;
                if (err.code === 'permission-denied') {
                    errorMessage = 'Permission denied accessing reviews. This might be a Firebase configuration issue.';
                } else if (err.code === 'unavailable') {
                    errorMessage = 'Firebase service temporarily unavailable. Please try again.';
                }
                callback({ reviews: [], error: errorMessage })
            }
        );
    } catch (error) {
        console.error('Error setting up recent reviews subscription:', error);
        callback({ reviews: [], error: error.message });
        return () => { };
    }
};
