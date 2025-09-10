import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserRole } from '../hooks/useUserRole';
import { getThread, getReplies, deleteThread, deleteReply, likeThread } from '../services/forumServiceSimple';
import ReplyCard from '../components/ReplyCard';
import ReplyForm from '../components/ReplyForm';
import { formatDateWithTooltip } from '../utils/dateUtils';
import '../styles/thread-detail.css';

const ThreadDetail = () => {
    const { threadId } = useParams();
    const { user } = useAuth();
    const { userRole } = useUserRole();
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadThreadAndReplies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const threadResult = await getThread(threadId);
            if (threadResult.success) {
                setThread(threadResult.thread);
                const repliesResult = await getReplies(threadId);
                if (repliesResult.success) {
                    setReplies(repliesResult.replies);
                } else {setError(`Failed to load replies: ${repliesResult.error}`);
                    setReplies([]); // Set empty array as fallback
                }
            } else {setError(`Failed to load thread: ${threadResult.error}`);
                // Don't automatically redirect - let user choose to go back
            }
        } catch (err) {setError('Failed to load thread data.');
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        loadThreadAndReplies();
    }, [loadThreadAndReplies]);

    const handleReplyPosted = () => {
        loadThreadAndReplies();
    };

    const handleThreadDelete = async () => {
        if (window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
            try {
                const result = await deleteThread(threadId);
                if (result.success) {
                    navigate('/forums');
                } else {alert('Failed to delete thread. Please try again.');
                }
            } catch (error) {alert('An error occurred while deleting the thread.');
            }
        }
    };

    const handleReplyDelete = async (replyId) => {
        try {
            const result = await deleteReply(replyId, threadId);
            if (result.success) {
                // Remove the deleted reply from the current list
                setReplies(prevReplies => prevReplies.filter(reply => reply.id !== replyId));
                // Update thread reply count
                setThread(prevThread => ({
                    ...prevThread,
                    replyCount: Math.max(0, prevThread.replyCount - 1)
                }));
            } else {alert('Failed to delete reply. Please try again.');
            }
        } catch (error) {alert('An error occurred while deleting the reply.');
        }
    };

    const handleThreadLike = async () => {
        if (!user) {
            alert('Please log in to like threads');
            return;
        }

        try {
            const result = await likeThread(threadId, user.uid);
            if (result.success) {
                setThread(prevThread => ({
                    ...prevThread,
                    likedBy: result.liked
                        ? [...(prevThread.likedBy || []), user.uid]
                        : (prevThread.likedBy || []).filter(id => id !== user.uid)
                }));
            } else {}
        } catch (error) {}
    };

    const handleReplyLike = (replyId, liked, likeCount) => {
        // Update the reply in the current list
        setReplies(prevReplies =>
            prevReplies.map(reply =>
                reply.id === replyId
                    ? { ...reply, likedBy: liked ? [...(reply.likedBy || []), user.uid] : (reply.likedBy || []).filter(id => id !== user.uid) }
                    : reply
            )
        );
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

    // Check if user can delete this thread
    const canDeleteThread = user && (
        user.uid === thread.authorId ||
        userRole?.role === 'admin'
    );

    return (
        <div className="thread-detail-container">
            <div className="thread-detail-header">
                <div className="thread-header-top">
                    <Link to="/forums" className="back-link">&larr; Back to Forums</Link>
                    {canDeleteThread && (
                        <button
                            className="delete-btn thread-delete-btn"
                            onClick={handleThreadDelete}
                            title="Delete thread"
                        >
                            🗑️ Delete Thread
                        </button>
                    )}
                </div>
                <h1>{thread.title}</h1>
                <div className="thread-meta">
                    <div className="author-info-detail">
                        <div className="author-avatar-detail">
                            {thread.authorAvatar ? (
                                <img
                                    src={thread.authorAvatar}
                                    alt={thread.authorName}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="default-avatar-detail"
                                style={{ display: thread.authorAvatar ? 'none' : 'flex' }}
                            >
                                {thread.authorName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        </div>
                        <span>By {thread.authorName}</span>
                    </div>
                    <span>&bull;</span>
                    <span title={threadDateInfo.tooltip}>{threadDateInfo.display}</span>
                </div>
            </div>

            <div className="thread-content-detail" dangerouslySetInnerHTML={{ __html: thread.content }}>
            </div>

            <div className="thread-actions">
                <button
                    className={`like-btn thread-like-btn ${thread.likedBy?.includes(user?.uid) ? 'liked' : ''}`}
                    onClick={handleThreadLike}
                    title={thread.likedBy?.includes(user?.uid) ? 'Unlike' : 'Like'}
                >
                    <span className="like-icon">👍</span>
                    <span className="like-count">{thread.likedBy?.length || 0}</span>
                </button>
            </div>

            <div className="replies-section">
                <h2>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h2>
                <div className="replies-list">
                    {replies.map(reply => (
                        <ReplyCard
                            key={reply.id}
                            reply={reply}
                            onDelete={handleReplyDelete}
                            onLike={handleReplyLike}
                        />
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
