import React from 'react';
import { CATEGORY_LABELS } from '../services/forumService';

const ThreadCard = ({ thread, onClick }) => {
    const formatDate = (date) => {
        if (!date) return 'Unknown';
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) return 'Today';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    const stripHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    return (
        <div className="thread-card" onClick={onClick}>
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
                        <span className="post-date">posted {formatDate(thread.createdAt)}</span>
                    </div>
                </div>

                <div className="thread-stats">
                    <span className="stat-item" title="Replies">
                        <span className="stat-icon">💬</span>
                        {thread.replyCount}
                    </span>
                    <span className="stat-item" title="Views">
                        <span className="stat-icon">👀</span>
                        {thread.viewCount}
                    </span>
                    <span className="stat-item" title="Likes">
                        <span className="stat-icon">👍</span>
                        {thread.likedBy?.length || 0}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ThreadCard;
