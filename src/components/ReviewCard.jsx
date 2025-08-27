import React, { useState } from 'react';

const Stars = ({ value = 0 }) => {
    const v = Math.max(0, Math.min(5, Number(value)));
    return (
        <span className="review-stars" aria-label={`${v} out of 5`}>
            {'★'.repeat(Math.round(v)).padEnd(5, '☆')}
        </span>
    );
};

const ReviewCard = ({ review, showCourseTitle = false, isOwner = false, isAdmin = false, onEdit, onDelete, onAdminDelete }) => {
    // State for expanding long comments - must be called before any early returns
    const [isExpanded, setIsExpanded] = useState(false);

    if (!review) return null;

    const { userName, rating, comment, verified, createdAt, courseTitle } = review;
    const dateText = createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : '';

    // Check if comment is long enough to need expansion
    const commentLength = (comment || '').length;
    const isLongComment = commentLength > 300;
    const displayComment = isLongComment && !isExpanded
        ? comment.slice(0, 300) + '...'
        : comment;

    return (
        <div className="review-card" id={`review-${review.id}`}>
            {/* Admin delete button in top-right corner */}
            {isAdmin && !isOwner && onAdminDelete && (
                <button
                    className="review-admin-delete-corner"
                    onClick={onAdminDelete}
                    title="Admin: Delete this review"
                >
                    🗑️
                </button>
            )}

            <div className="review-card-header">
                <div className="review-user">
                    <div className="review-avatar" aria-hidden>👤</div>
                    <div>
                        <div className="review-username">
                            <span>{userName || 'User'}</span>
                            {verified && <span className="review-verified" title="Verified User">✓</span>}
                        </div>
                        {dateText && <div className="review-date">{dateText}</div>}
                    </div>
                </div>
                <Stars value={rating} />
            </div>

            {showCourseTitle && courseTitle && (
                <div className="review-course-chip">{courseTitle}</div>
            )}

            <div className="review-comment-section">
                <p className={`review-comment ${isExpanded ? 'expanded' : ''}`}>
                    {displayComment}
                </p>
                {isLongComment && (
                    <button
                        className="review-expand-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            {isOwner && (
                <div className="review-actions">
                    {onEdit && (
                        <button className="btn btn-secondary btn-small" onClick={onEdit}>Edit</button>
                    )}
                    {onDelete && (
                        <button className="btn btn-secondary btn-small" onClick={onDelete}>Delete</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
