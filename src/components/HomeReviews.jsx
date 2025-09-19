import React, { useState, useEffect } from 'react';
import { useRecentReviews } from '../hooks/useRecentReviews';
import { useUserRole } from '../hooks/useUserRole';
import { deleteReviewByIdAsAdmin } from '../services/reviewService';
import { Link } from 'react-router-dom';

const clamp = (text, max = 220) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max - 1) + '…';
};

const HomeReviews = () => {
    const { reviews, loading, error } = useRecentReviews({ limit: 18 }); // Load more for rotation
    const { isAdminUser } = useUserRole();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState(new Set());

    const handleImageError = (reviewId) => {
        setImageErrors(prev => new Set([...prev, reviewId]));
    };

    const handleAdminDelete = async (review) => {
        if (!window.confirm(`Are you sure you want to delete ${review.userName}'s review? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await deleteReviewByIdAsAdmin(review.id);
            if (result.success) {
                alert('Review deleted successfully');
                // Note: The useRecentReviews hook should automatically update due to Firestore real-time listeners
                window.location.reload(); // Fallback to ensure UI updates
            } else {
                alert(`Failed to delete review: ${result.error}`);
            }
        } catch (error) {
            alert('Failed to delete review. Please try again.');
        }
    };

    // Auto-scroll functionality
    useEffect(() => {
        if (!reviews || reviews.length <= 3) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const maxIndex = reviews.length - 3;
                return prevIndex >= maxIndex ? 0 : prevIndex + 1;
            });
        }, 8000); // Change every 8 seconds

        return () => clearInterval(interval);
    }, [reviews]);

    // Get current 3 reviews to display
    const displayedReviews = reviews ? reviews.slice(currentIndex, currentIndex + 3) : [];

    return (
        <section className="home-reviews-section">
            <h2>What Students Say</h2>
            {loading && <div className="reviews-loading">Loading reviews…</div>}
            {error && <div className="reviews-error">{String(error)}</div>}
            {!loading && !error && (
                <div className="home-reviews-container">
                    <div className="home-reviews-row" role="list">
                        {displayedReviews.map((r) => {
                            const needsMore = (r.comment || '').length > 220;
                            const href = `/courses/${r.courseId}#reviews-section`;
                            const shouldShowImage = r.userPhotoURL && !imageErrors.has(r.id);

                            return (
                                <article key={r.id} className="home-review-card" role="listitem">
                                    <div className="home-review-header">
                                        <div className="review-user">
                                            <div className="review-avatar" aria-hidden>
                                                {shouldShowImage ? (
                                                    <img
                                                        src={r.userPhotoURL}
                                                        alt={r.userName || 'User'}
                                                        onError={() => handleImageError(r.id)}
                                                    />
                                                ) : (
                                                    <div className="default-avatar">
                                                        {(r.userName || 'User').charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="review-username">
                                                    <span>{r.userName || 'User'}</span>
                                                    {r.verified && <span className="review-verified" title="Verified User">✓</span>}
                                                </div>
                                                {/* TODO: Re-enable review dates later */}
                                                {/* <div className="review-date">
                                                    {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : ''}
                                                </div> */}
                                            </div>
                                        </div>
                                        <button
                                            className="review-stars clickable-stars"
                                            onClick={() => {
                                                // Navigate to the course page and scroll to reviews
                                                window.location.href = `/courses/${r.courseId}#reviews-section`;
                                            }}
                                            title="Click to view all reviews for this course"
                                            aria-label={`${r.rating} out of 5 stars. Click to view reviews for ${r.courseTitle}`}
                                        >
                                            {'★'.repeat(Math.round(r.rating || 0)).padEnd(5, '☆')}
                                        </button>
                                    </div>
                                    <div className="review-course-chip">{r.courseTitle || r.courseId}</div>
                                    <p className="home-review-comment">{clamp(r.comment)}</p>
                                    <div className="home-review-footer">
                                        {needsMore && (
                                            <Link to={href} className="home-review-more">Read more →</Link>
                                        )}
                                        {isAdminUser && (
                                            <button
                                                className="home-review-admin-delete-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAdminDelete(r);
                                                }}
                                                title="Admin: Delete this review"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    {reviews && reviews.length > 3 && (
                        <div className="home-reviews-indicators">
                            {Array.from({ length: Math.max(1, reviews.length - 2) }).map((_, index) => (
                                <button
                                    key={index}
                                    className={`review-indicator ${index === currentIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                    aria-label={`Show reviews ${index + 1}-${Math.min(index + 3, reviews.length)}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default HomeReviews;
