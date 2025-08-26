import React, { useEffect, useMemo, useState } from 'react';
import { addOrUpdateReview, getUserReviewForCourse, deleteReview } from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';

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
    const userName = useMemo(() => user?.displayName || user?.email?.split('@')[0] || 'User', [user]);

    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [hasExisting, setHasExisting] = useState(false);

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
        const res = await addOrUpdateReview({ userId, userName, courseId, courseTitle, rating, comment });
        setLoading(false);
        if (!res.success) {
            setError(res.error || 'Failed to submit review');
        } else {
            setHasExisting(true);
            onSubmitted && onSubmitted();
        }
    };

    const handleDelete = async () => {
        if (!userId) return;
        if (!window.confirm('Delete your review?')) return;
        setLoading(true);
        setError(null);
        const res = await deleteReview(courseId, userId);
        setLoading(false);
        if (!res.success) setError(res.error || 'Failed to delete review');
        else {
            setRating(0);
            setComment('');
            setHasExisting(false);
            onSubmitted && onSubmitted();
        }
    };

    if (!userId) {
        return <div className="review-form-login">Log in to write a review.</div>;
    }

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <div className="review-form-header">
                <h4>{hasExisting ? 'Edit your review' : 'Write a review'}</h4>
            </div>
            <StarInput value={rating} onChange={setRating} />
            <textarea
                className="review-textarea"
                value={comment}
                maxLength={2000}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                required
            />
            {error && <div className="review-error">{error}</div>}
            <div className="review-form-actions">
                <button className="btn" type="submit" disabled={loading || rating < 1}>
                    {loading ? 'Saving...' : hasExisting ? 'Update Review' : 'Submit Review'}
                </button>
                {hasExisting && (
                    <button className="btn btn-secondary" type="button" onClick={handleDelete} disabled={loading}>
                        Delete
                    </button>
                )}
            </div>
        </form>
    );
};

export default ReviewForm;
