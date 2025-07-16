import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getThreads, searchThreads, FORUM_CATEGORIES, CATEGORY_LABELS } from '../services/forumService';
import ThreadCard from '../components/ThreadCard';
import CreateThreadModal from '../components/CreateThreadModal';
import '../styles/forum.css';

// Error boundary wrapper component
class ForumErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Forum Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="forum-container">
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <h3>Something went wrong</h3>
                        <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
                        <button
                            className="create-thread-btn"
                            onClick={() => this.setState({ hasError: false, error: null })}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const ForumComponent = () => {
    console.log('Forum component rendered');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    const loadThreads = useCallback(async (reset = false) => {
        console.log('Loading threads...', { reset, selectedCategory });
        setLoading(true);
        setError(null);

        try {
            const result = await getThreads(selectedCategory, 10, reset ? null : lastDoc);
            console.log('Threads result:', result);

            if (result.success) {
                setThreads(prev => reset ? result.threads : [...prev, ...result.threads]);
                setHasMore(result.hasMore);
                setLastDoc(result.lastDoc);
            } else {
                console.error("Failed to load threads:", result.error);
                setError(result.error);
                setThreads([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading threads:', error);
            setError(error.message);
            setThreads([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, lastDoc]);

    useEffect(() => {
        console.log('Forum useEffect triggered');
        setIsSearching(false);

        // Wrap the loadThreads call in a try-catch to prevent uncaught errors
        try {
            loadThreads(true);
        } catch (error) {
            console.error('Error in useEffect:', error);
            setError(error.message);
            setLoading(false);
        }
    }, [selectedCategory]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setIsSearching(false);
            loadThreads(true);
            return;
        }

        setLoading(true);
        setIsSearching(true);
        try {
            const result = await searchThreads(searchTerm, selectedCategory);
            if (result.success) {
                setThreads(result.threads);
                setHasMore(false);
            } else {
                console.error("Failed to search threads:", result.error);
            }
        } catch (error) {
            console.error('Error searching threads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateThread = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowCreateModal(true);
    };

    const handleThreadCreated = () => {
        setShowCreateModal(false);
        loadThreads(true);
    };

    return (
        <div className="forum-container">
            <div className="forum-header">
                <div className="forum-title">
                    <h1>Community Forum</h1>
                    <p>Join the conversation and connect with fellow learners</p>
                </div>
                <button className="create-thread-btn" onClick={handleCreateThread}>
                    {user ? 'Start New Discussion' : 'Login to Post'}
                </button>
            </div>

            <div className="forum-controls">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">🔍</button>
                </form>

                <div className="category-filter">
                    <button
                        className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Categories
                    </button>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="forum-content">
                {error ? (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <h3>Error Loading Forum</h3>
                        <p>{error}</p>
                        <button
                            className="create-thread-btn"
                            onClick={() => {
                                setError(null);
                                loadThreads(true);
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : loading && threads.length === 0 ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading discussions...</p>
                    </div>
                ) : threads.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>No discussions found</h3>
                        <p>{isSearching ? 'Try a different search term.' : 'Be the first to start a discussion!'}</p>
                        {!isSearching && (
                            <button className="create-thread-btn" onClick={handleCreateThread}>
                                {user ? 'Start First Discussion' : 'Login to Post'}
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="threads-list">
                            {threads.map((thread) => (
                                <ThreadCard
                                    key={thread.id}
                                    thread={thread}
                                    onClick={() => navigate(`/forums/thread/${thread.id}`)}
                                />
                            ))}
                        </div>

                        {hasMore && !isSearching && (
                            <button
                                className="load-more-btn"
                                onClick={() => loadThreads()}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        )}
                    </>
                )}
            </div>

            {showCreateModal && (
                <CreateThreadModal
                    onClose={() => setShowCreateModal(false)}
                    onThreadCreated={handleThreadCreated}
                />
            )}
        </div>
    );
};

const Forum = () => (
    <ForumErrorBoundary>
        <ForumComponent />
    </ForumErrorBoundary>
);

export default Forum;
