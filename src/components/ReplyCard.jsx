import React from 'react';
import { formatDateWithTooltip } from '../utils/dateUtils';

const ReplyCard = ({ reply }) => {
    const dateInfo = formatDateWithTooltip(reply.createdAt);

    return (
        <div className="reply-card">
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
            <div className="reply-content" dangerouslySetInnerHTML={{ __html: reply.content }}>
            </div>
        </div>
    );
};

export default ReplyCard;
