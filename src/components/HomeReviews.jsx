import React from 'react';
import { useRecentReviews } from '../hooks/useRecentReviews';
import { Link } from 'react-router-dom';

const clamp = (text, max = 220) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max - 1) + '…';
};

const HomeReviews = () => {
    const { reviews, loading, error } = useRecentReviews({ limit: 12 });

    return (
        <section className="home-reviews-section">
            <h2>What Students Say</h2>
            {loading && <div className="reviews-loading">Loading reviews…</div>}
            {error && <div className="reviews-error">{String(error)}</div>}
            {!loading && !error && (
                <div className="home-reviews-row" role="list">
                    {reviews.map((r) => {
                        const needsMore = (r.comment || '').length > 220;
                        const href = `/courses/${r.courseId}#review-${r.id}`;
                        return (
                            <article key={r.id} className="home-review-card" role="listitem">
                                <div className="home-review-header">
                                    <div className="review-user">
                                        <div className="review-avatar" aria-hidden>👤</div>
                                        <div>
                                            <div className="review-username">
                                                {r.userName || 'User'}
                                                {r.verified && <span className="review-verified">Verified</span>}
                                            </div>
                                            <div className="review-date">
                                                {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="review-stars">{'★'.repeat(Math.round(r.rating || 0)).padEnd(5, '☆')}</span>
                                </div>
                                <div className="review-course-chip">{r.courseTitle || r.courseId}</div>
                                <p className="home-review-comment">{clamp(r.comment)}</p>
                                {needsMore && (
                                    <Link to={href} className="home-review-more">Read more →</Link>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default HomeReviews;
