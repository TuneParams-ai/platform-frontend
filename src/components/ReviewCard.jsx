import React from 'react';

const Stars = ({ value = 0 }) => {
    const v = Math.max(0, Math.min(5, Number(value)));
    return (
        <span className="review-stars" aria-label={`${v} out of 5`}>
            {'★'.repeat(Math.round(v)).padEnd(5, '☆')}
        </span>
    );
};

const ReviewCard = ({ review, showCourseTitle = false, isOwner = false, isAdmin = false, onEdit, onDelete, onAdminDelete }) => {
    if (!review) return null;
    const { userName, rating, comment, verified, createdAt, courseTitle } = review;
    const dateText = createdAt?.toDate ? createdAt.toDate().toLocaleDateString() : '';

    return (
        <div className="review-card" id={`review-${review.id}`}>
            <div className="review-card-header">
                <div className="review-user">
                    <div className="review-avatar" aria-hidden>👤</div>
                    <div>
                        <div className="review-username">
                            <span>{userName || 'User'}</span>
                            {verified && <span className="review-verified">Verified</span>}
                        </div>
                        {dateText && <div className="review-date">{dateText}</div>}
                    </div>
                </div>
                <Stars value={rating} />
            </div>
            {showCourseTitle && courseTitle && (
                <div className="review-course-chip">{courseTitle}</div>
            )}
            <p className="review-comment">{comment}</p>
            {(isOwner || isAdmin) && (
                <div className="review-actions">
                    {isOwner && onEdit && (
                        <button className="btn btn-secondary btn-small" onClick={onEdit}>Edit</button>
                    )}
                    {isOwner && onDelete && (
                        <button className="btn btn-secondary btn-small" onClick={onDelete}>Delete</button>
                    )}
                    {isAdmin && !isOwner && onAdminDelete && (
                        <button
                            className="review-admin-delete-btn"
                            onClick={onAdminDelete}
                            title="Admin: Delete this review"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
