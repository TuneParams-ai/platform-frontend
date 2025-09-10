import React, { useState } from 'react';
import { likeReply } from '../services/forumServiceSimple';
import { formatDateWithTooltip } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';

const ReplyCard = ({ reply, onDelete, onLike }) => {
    const { user } = useAuth();
    const { userRole } = useUserRole();
    const [isLiking, setIsLiking] = useState(false);
    const [likeCount, setLikeCount] = useState(reply.likedBy?.length || 0);
    const [isLiked, setIsLiked] = useState(user ? reply.likedBy?.includes(user.uid) : false);
    const dateInfo = formatDateWithTooltip(reply.createdAt);

    // Check if user can delete this reply (only if user is logged in)
    const canDelete = user && (
        user.uid === reply.authorId ||
        userRole?.role === 'admin'
    );

    const handleDelete = async (e) => {
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
            if (onDelete) {
                await onDelete(reply.id);
            }
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();

        if (!user) {
            alert('Please log in to like replies');
            return;
        }

        if (isLiking) return;

        setIsLiking(true);
        try {
            const result = await likeReply(reply.id, user.uid);
            if (result.success) {
                setIsLiked(result.liked);
                setLikeCount(result.likeCount);

                // Call parent callback if provided
                if (onLike) {
                    onLike(reply.id, result.liked, result.likeCount);
                }
            } else {
                console.error('Failed to like reply:', result.error);
            }
        } catch (error) {
            console.error('Error liking reply:', error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="reply-card">
            <div className="reply-author">
                <div className="author-avatar-reply">
                    {reply.authorAvatar ? (
                        <img
                            src={reply.authorAvatar}
                            alt={reply.authorName}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className="default-avatar-reply"
                        style={{ display: reply.authorAvatar ? 'none' : 'flex' }}
                    >
                        {reply.authorName?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                </div>
                <div className="author-info-reply">
                    <span className="author-name-reply">{reply.authorName || 'Anonymous'}</span>
                    <span
                        className="post-date-reply"
                        title={dateInfo.tooltip}
                    >
                        {dateInfo.display}
                    </span>
                </div>
            </div>
            <div className="reply-content-wrapper">
                <div className="reply-content" dangerouslySetInnerHTML={{ __html: reply.content }}>
                </div>
                <div className="reply-footer">
                    <button
                        className={`like-btn reply-like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                        disabled={isLiking}
                        title={isLiked ? 'Unlike' : 'Like'}
                    >
                        <span className="like-icon">👍</span>
                        <span className="like-count">{likeCount}</span>
                    </button>
                    {canDelete && (
                        <button
                            className="delete-btn reply-delete-btn"
                            onClick={handleDelete}
                            title="Delete reply"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReplyCard;
