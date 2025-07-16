import React from 'react';
import { CATEGORY_LABELS, roundViewCount } from '../services/forumServiceSimple';
import { formatDateWithTooltip } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';

const ThreadCard = ({ thread, onClick, onDelete }) => {
    const { user } = useAuth();
    const { userRole } = useUserRole();

    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    const dateInfo = formatDateWithTooltip(thread.createdAt);
    const lastReplyInfo = formatDateWithTooltip(thread.lastReplyAt);

    // Check if user can delete this thread (only if user is logged in)
    const canDelete = user && (
        user.uid === thread.authorId ||
        userRole?.role === 'admin'
    );

    const handleDelete = async (e) => {
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
            if (onDelete) {
                await onDelete(thread.id);
            }
        }
    };

    const handleCardClick = (e) => {
        // Don't trigger onClick if clicking on delete button
        if (e.target.closest('.delete-btn')) {
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    return (
        <div className="thread-card" onClick={handleCardClick}>
            <div className="thread-header">
                <div className="thread-title-row">
                    <h3 className="thread-title">
                        {thread.isPinned && <span className="pin-icon" title="Pinned">📌</span>}
                        {thread.title}
                    </h3>
                    <span className="thread-category" style={{ backgroundColor: `var(--category-${thread.category}-color)` }}>
                        {CATEGORY_LABELS[thread.category] || 'General'}
                    </span>
                </div>
                <p className="thread-preview">{stripHtml(thread.content).substring(0, 150)}...</p>
            </div>

            <div className="thread-footer">
                <div className="thread-author">
                    <div className="author-avatar">
                        {thread.authorAvatar ? (
                            <img src={thread.authorAvatar} alt={thread.authorName} />
                        ) : (
                            <div className="default-avatar">
                                {thread.authorName?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="author-info">
                        <span className="author-name">{thread.authorName}</span>
                        <span className="post-date" title={dateInfo.tooltip}>
                            posted {dateInfo.display}
                        </span>
                    </div>
                </div>

                <div className="thread-stats">
                    <span className="stat-item" title="Replies">
                        <span className="stat-icon">💬</span>
                        {thread.replyCount}
                    </span>
                    <span className="stat-item" title="Views">
                        <span className="stat-icon">👀</span>
                        {roundViewCount(thread.viewCount)}
                    </span>
                    <span className="stat-item" title="Likes">
                        <span className="stat-icon">👍</span>
                        {thread.likedBy?.length || 0}
                    </span>
                    {thread.lastReplyAt && thread.lastReplyAt.getTime() !== thread.createdAt.getTime() && (
                        <span className="stat-item" title={`Last reply: ${lastReplyInfo.tooltip}`}>
                            <span className="stat-icon">⏱️</span>
                            {lastReplyInfo.display}
                        </span>
                    )}
                    {canDelete && (
                        <button
                            className="delete-btn thread-stats-delete"
                            onClick={handleDelete}
                            title="Delete thread"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreadCard;
