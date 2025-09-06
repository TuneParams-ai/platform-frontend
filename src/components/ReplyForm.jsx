import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createReply } from '../services/forumServiceSimple';

const ReplyForm = ({ threadId, onReplyPosted }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Reply cannot be empty.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const replyData = {
                threadId,
                content,
                authorId: user.uid,
                authorEmail: user.email,
                authorName: user.name || user.displayName || 'Anonymous',
                authorAvatar: user.photoURL || null,
            };

            const result = await createReply(replyData);

            if (result.success) {
                setContent('');
                onReplyPosted();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to post reply.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="reply-form">
            <h3>Leave a Reply</h3>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your reply... You can use basic HTML for formatting."
                rows="5"
                required
            ></textarea>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
        </form>
    );
};

export default ReplyForm;
