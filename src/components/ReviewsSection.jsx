import React from 'react';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { deleteReviewByIdAsAdmin } from '../services/reviewService';

const ReviewsSection = ({ courseId, courseTitle }) => {
    const { user, loading: authLoading } = useAuth();
    const { isAdminUser } = useUserRole();
    const [reviewLimit, setReviewLimit] = React.useState(10);
    const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews(courseId, { limit: reviewLimit });

    const avgRating = React.useMemo(() => {
        if (!reviews?.length) return null;
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        return Math.round((sum / reviews.length) * 10) / 10;
    }, [reviews]);

    const handleAdminDeleteReview = React.useCallback(async (review) => {
        if (!isAdminUser) {
            alert('You do not have permission to delete reviews.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${review.userName}'s review? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await deleteReviewByIdAsAdmin(review.id);
            if (result.success) {
                alert('Review deleted successfully');
            } else {
                alert(`Failed to delete review: ${result.error}`);
            }
        } catch (error) {
            alert('Failed to delete review. Please try again.');
        }
    }, [isAdminUser]);

    const handleLoadMore = () => {
        setReviewLimit(prev => prev + 10);
    };

    return (
        <section className="course-section" id="reviews-section">
            <h3>Student Reviews</h3>
            <div className="course-reviews-summary">
                {reviewsLoading ? (
                    <p>Loading reviews...</p>
                ) : reviewsError ? (
                    <div>
                        <p className="course-detail-error-text">Error loading reviews: {reviewsError}</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                            Reviews should be visible to all users. If you're seeing this error,
                            there might be a Firebase configuration issue.
                        </p>
                    </div>
                ) : (
                    <p>
                        {avgRating ? `⭐ ${avgRating} / 5` : 'No ratings yet'}
                        {reviews?.length ? ` · ${reviews.length} review${reviews.length > 1 ? 's' : ''}` : ''}
                    </p>
                )}
            </div>

            {/* Review Form - only show when not loading auth and user is available */}
            {!authLoading && (
                <ReviewForm
                    courseId={courseId}
                    courseTitle={courseTitle}
                    onSubmitted={() => { }}
                />
            )}

            {/* Reviews List - show regardless of auth state */}
            <div className="course-reviews-list" id="reviews-list">
                <ReviewList
                    reviews={reviews}
                    loading={reviewsLoading}
                    error={reviewsError}
                    currentUserId={user?.uid}
                    isCurrentUserAdmin={isAdminUser}
                    onAdminDelete={handleAdminDeleteReview}
                />
                {!reviewsLoading && !reviewsError && reviews.length > 0 && reviews.length % 10 === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                            onClick={handleLoadMore}
                            className="btn btn-secondary"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            Load More Reviews
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ReviewsSection;
