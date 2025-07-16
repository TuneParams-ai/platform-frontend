import React from 'react';

const ReplyCard = ({ reply }) => {
    return (
        <div className="reply-card">
            <div className="reply-author">
                <div className="author-avatar-reply">
                    {reply.authorAvatar ? (
                        <img src={reply.authorAvatar} alt={reply.authorName} />
                    ) : (
                        <div className="default-avatar-reply">
                            {reply.authorName?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="author-info-reply">
                    <span className="author-name-reply">{reply.authorName}</span>
                    <span className="post-date-reply">{reply.createdAt?.toLocaleDateString()}</span>
                </div>
            </div>
            <div className="reply-content" dangerouslySetInnerHTML={{ __html: reply.content }}>
            </div>
        </div>
    );
};

export default ReplyCard;
