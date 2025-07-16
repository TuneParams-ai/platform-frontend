import React from 'react';
import { formatDateWithTooltip } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';

const ReplyCard = ({ reply, onDelete }) => {
    const { user } = useAuth();
    const { userRole } = useUserRole();
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

    return (
        <div className="reply-card">
            <div className="reply-header">
                <div className="reply-author">
                    <div className="author-avatar-reply">
                        {reply.authorAvatar ? (
                            <img src={reply.authorAvatar} alt={reply.authorName} />
                        ) : (
                            <div className="default-avatar-reply">
                                {reply.authorName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        )}
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
            </div>
            <div className="reply-content" dangerouslySetInnerHTML={{ __html: reply.content }}>
            </div>
            {canDelete && (
                <div className="reply-actions">
                    <button
                        className="delete-btn reply-delete-btn"
                        onClick={handleDelete}
                        title="Delete reply"
                    >
                        🗑️
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReplyCard;
