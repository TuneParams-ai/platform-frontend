import React, { useEffect, useState } from 'react';
import { addOrUpdateReview, getUserReviewForCourse, deleteReview } from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../services/userService';

const StarInput = ({ value = 0, onChange }) => {
    return (
        <div className="star-input" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    className={`star ${n <= value ? 'active' : ''}`}
                    onClick={() => onChange(n)}
                    aria-checked={value === n}
                    role="radio"
                >
                    {n <= value ? '★' : '☆'}
                </button>
            ))}
        </div>
    );
};

const ReviewForm = ({ courseId, courseTitle, onSubmitted }) => {
    const { user } = useAuth();
    const userId = user?.uid;

    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [hasExisting, setHasExisting] = useState(false);
    const [userDisplayName, setUserDisplayName] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Get user display name from profile
    useEffect(() => {
        const fetchUserDisplayName = async () => {
            if (!userId) return;

            // First try to use display name from auth
            if (user?.displayName) {
                setUserDisplayName(user.displayName);
                return;
            }

            // If no display name in auth, get it from Firestore profile
            try {
                const userProfile = await getUserProfile(userId);
                if (userProfile.success && userProfile.userData?.displayName) {
                    setUserDisplayName(userProfile.userData.displayName);
                } else {
                    // Fallback to email username as last resort
                    setUserDisplayName(user?.email?.split('@')[0] || 'User');
                }
            } catch (error) {
                setUserDisplayName(user?.email?.split('@')[0] || 'User');
            }
        };

        fetchUserDisplayName();
    }, [user, userId]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!userId || !courseId) return;
            const res = await getUserReviewForCourse(userId, courseId);
            if (!mounted) return;
            if (res.success && res.review) {
                setRating(res.review.rating || 0);
                setComment(res.review.comment || '');
                setHasExisting(true);
            } else {
                setRating(0);
                setComment('');
                setHasExisting(false);
            }
        })();
        return () => { mounted = false; };
    }, [userId, courseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError('Please log in to leave a review.');
            return;
        }
        setLoading(true);
        setError(null);

        // Try to get photoURL from auth context first, then from user profile in Firestore
        let photoURL = user?.photoURL || user?.photoUrl || '';

        // If no photoURL in auth context, try to get it from Firestore user profile
        if (!photoURL && userId) {
            try {
                const userProfile = await getUserProfile(userId);
                if (userProfile.success && userProfile.userData?.photoURL) {
                    photoURL = userProfile.userData.photoURL;
                }
            } catch (error) { }
        }

        const res = await addOrUpdateReview({
            userId,
            userName: userDisplayName,
            userEmail: user?.email,
            userPhotoURL: photoURL,
            courseId,
            courseTitle,
            rating,
            comment
        });
        setLoading(false);
        if (!res.success) {
            setError(res.error || 'Failed to submit review');
            return false;
        } else {
            setHasExisting(true);
            return true;
        }
    };

    const handleDelete = async () => {
        if (!userId) return false;
        if (!window.confirm('Delete your review?')) return false;
        setLoading(true);
        setError(null);
        const res = await deleteReview(courseId, userId);
        setLoading(false);
        if (!res.success) {
            setError(res.error || 'Failed to delete review');
            return false;
        } else {
            setRating(0);
            setComment('');
            setHasExisting(false);
            return true;
        }
    };

    if (!userId) {
        return <div className="review-form-login">Log in to write a review.</div>;
    }

    const handleFormToggle = () => {
        setIsFormVisible(!isFormVisible);
        if (!isFormVisible) {
            // Reset error when opening form
            setError(null);
        }
    };

    const handleSubmitSuccess = () => {
        // Close form after successful submission
        setIsFormVisible(false);
        onSubmitted && onSubmitted();
    };

    const handleDeleteSuccess = () => {
        // Close form after successful deletion
        setIsFormVisible(false);
        onSubmitted && onSubmitted();
    };

    return (
        <div className="review-form-container">
            {/* Toggle Button */}
            <div className="review-form-toggle">
                <button
                    className={`btn ${hasExisting ? 'btn-secondary' : 'btn-primary'} review-toggle-btn`}
                    onClick={handleFormToggle}
                    type="button"
                >
                    {isFormVisible ? (
                        '✕ Cancel'
                    ) : hasExisting ? (
                        'Edit Review'
                    ) : (
                        'Write a Review'
                    )}
                </button>
            </div>

            {/* Review Form - Collapsible */}
            {isFormVisible && (
                <form className="review-form" onSubmit={async (e) => {
                    e.preventDefault();
                    const success = await handleSubmit(e);
                    if (success) {
                        handleSubmitSuccess();
                    }
                }}>
                    <div className="review-form-header">
                        <h4>{hasExisting ? 'Edit your review' : 'Write a review'}</h4>
                    </div>
                    <StarInput value={rating} onChange={setRating} />
                    <div className="review-textarea-container">
                        <textarea
                            className="review-textarea"
                            value={comment}
                            maxLength={3000}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                            required
                        />
                        <div className="character-counter">
                            <span className={comment.length > 2700 ? 'character-counter-warning' : ''}>
                                {comment.length}/3000 characters
                            </span>
                        </div>
                    </div>
                    {error && <div className="review-error">{error}</div>}
                    <div className="review-form-actions">
                        <button className="btn" type="submit" disabled={loading || rating < 1}>
                            {loading ? 'Saving...' : hasExisting ? 'Update Review' : 'Submit Review'}
                        </button>
                        {hasExisting && (
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={async () => {
                                    const success = await handleDelete();
                                    if (success) {
                                        handleDeleteSuccess();
                                    }
                                }}
                                disabled={loading}
                            >
                                Delete
                            </button>
                        )}
                        <button
                            className="btn btn-tertiary"
                            type="button"
                            onClick={handleFormToggle}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ReviewForm;
