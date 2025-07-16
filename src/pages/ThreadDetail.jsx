import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getThread, getReplies, incrementThreadViewCount } from '../services/forumServiceSimple';
import ReplyCard from '../components/ReplyCard';
import ReplyForm from '../components/ReplyForm';
import { formatDateWithTooltip } from '../utils/dateUtils';
import '../styles/thread-detail.css';

const ThreadDetail = () => {
    const { threadId } = useParams();
    const { user } = useAuth();
    const viewCountIncremented = useRef(null); // Track by threadId

    const [thread, setThread] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadRepliesOnly = useCallback(async () => {
        try {
            const repliesResult = await getReplies(threadId);
            if (repliesResult.success) {
                setReplies(repliesResult.replies);
            } else {
                console.error('Failed to load replies:', repliesResult.error);
            }
        } catch (err) {
            console.error('Error loading replies:', err);
        }
    }, [threadId]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            console.log('Loading thread with ID:', threadId);

            try {
                const threadResult = await getThread(threadId);
                console.log('Thread result:', threadResult);

                if (!isMounted) return; // Component unmounted, don't continue

                if (threadResult.success) {
                    setThread(threadResult.thread);

                    // Only increment view count once per threadId
                    if (viewCountIncremented.current !== threadId) {
                        console.log('Incrementing view count for thread:', threadId);
                        await incrementThreadViewCount(threadId);
                        viewCountIncremented.current = threadId;
                    }

                    const repliesResult = await getReplies(threadId);
                    if (isMounted && repliesResult.success) {
                        setReplies(repliesResult.replies);
                    } else if (isMounted) {
                        console.error('Failed to load replies:', repliesResult.error);
                        setError(`Failed to load replies: ${repliesResult.error}`);
                        setReplies([]); // Set empty array as fallback
                    }
                } else {
                    console.error('Failed to load thread:', threadResult.error);
                    if (isMounted) {
                        setError(`Failed to load thread: ${threadResult.error}`);
                    }
                }
            } catch (err) {
                console.error('Error in loadData:', err);
                if (isMounted) {
                    setError('Failed to load thread data.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [threadId]);

    const handleReplyPosted = () => {
        loadRepliesOnly(); // Only reload replies, not the entire thread
    };

    if (loading) {
        return (
            <div className="loading-state-detail">
                <div className="loading-spinner"></div>
                <p>Loading discussion...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state-detail">
                <h3>Error</h3>
                <p>{error}</p>
                <Link to="/forums" className="btn-primary">Back to Forums</Link>
            </div>
        );
    }

    if (!thread) {
        return null; // Redirect is handled in error state
    }

    const threadDateInfo = formatDateWithTooltip(thread.createdAt);

    return (
        <div className="thread-detail-container">
            <div className="thread-detail-header">
                <Link to="/forums" className="back-link">&larr; Back to Forums</Link>
                <h1>{thread.title}</h1>
                <div className="thread-meta">
                    <div className="author-info-detail">
                        <img src={thread.authorAvatar || '/default-avatar.png'} alt={thread.authorName} className="author-avatar-detail" />
                        <span>By {thread.authorName}</span>
                    </div>
                    <span>&bull;</span>
                    <span title={threadDateInfo.tooltip}>{threadDateInfo.display}</span>
                </div>
            </div>

            <div className="thread-content-detail" dangerouslySetInnerHTML={{ __html: thread.content }}>
            </div>

            <div className="replies-section">
                <h2>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h2>
                <div className="replies-list">
                    {replies.map(reply => (
                        <ReplyCard key={reply.id} reply={reply} />
                    ))}
                </div>
            </div>

            <div className="reply-form-section">
                {user ? (
                    <ReplyForm threadId={threadId} onReplyPosted={handleReplyPosted} />
                ) : (
                    <div className="login-prompt">
                        <p>You must be logged in to reply.</p>
                        <Link to="/login" className="btn-primary">Login to Reply</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreadDetail;
