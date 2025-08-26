import React from 'react';
import ReviewCard from './ReviewCard';

const formatIndexError = (error) => {
    if (!error) return null;
    const msg = typeof error === 'string' ? error : String(error);
    if (msg.toLowerCase().includes('requires an index')) {
        const urlMatch = msg.match(/https?:\/\/\S+/);
        const href = urlMatch ? urlMatch[0] : 'https://console.firebase.google.com/';
        return (
            <div>
                This query needs a Firestore composite index.{' '}
                <a href={href} target="_blank" rel="noopener noreferrer">Create index</a>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>
                    Fields: courseId Asc, createdAt Desc (Collection: course_reviews)
                </div>
            </div>
        );
    }
    return msg;
};

const ReviewList = ({ reviews = [], loading = false, error = null, showCourseTitle = false, currentUserId, onEdit, onDelete }) => {
    if (loading) return <div className="reviews-loading">Loading reviews...</div>;
    if (error) return <div className="reviews-error">{formatIndexError(error)}</div>;
    if (!reviews.length) return <div className="reviews-empty">No reviews yet.</div>;

    return (
        <div className="reviews-list">
            {reviews.map((r) => (
                <ReviewCard
                    key={r.id}
                    review={r}
                    showCourseTitle={showCourseTitle}
                    isOwner={currentUserId && r.userId === currentUserId}
                    onEdit={onEdit ? () => onEdit(r) : undefined}
                    onDelete={onDelete ? () => onDelete(r) : undefined}
                />)
            )}
        </div>
    );
};

export default ReviewList;
