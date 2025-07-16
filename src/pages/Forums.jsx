import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getThreads, searchThreads, CATEGORY_LABELS } from '../services/forumServiceSimple';
import ThreadCard from '../components/ThreadCard';
import CreateThreadModal from '../components/CreateThreadModal';
import '../styles/forum.css';

// Error boundary wrapper component
class ForumsErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Forums Error:', error, errorInfo);
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

const ForumsComponent = () => {
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
        setLoading(true);
        setError(null);

        try {
            const result = await getThreads(selectedCategory, 10, reset ? null : lastDoc);

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

    // Set document title and ensure favicon is properly configured
    useEffect(() => {
        document.title = 'Community Forums - TuneParams.ai';

        // Ensure favicon is properly set with cache busting
        const favicon = document.querySelector('link[rel="icon"]');
        const timestamp = Date.now();

        if (favicon) {
            favicon.href = `/favicon.ico?v=${timestamp}`;
        } else {
            // Create favicon link if it doesn't exist
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = `/favicon.ico?v=${timestamp}`;
            newFavicon.type = 'image/x-icon';
            document.head.appendChild(newFavicon);
        }

        // Also handle shortcut icon for better compatibility
        let shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
        if (!shortcutIcon) {
            shortcutIcon = document.createElement('link');
            shortcutIcon.rel = 'shortcut icon';
            shortcutIcon.href = `/favicon.ico?v=${timestamp}`;
            shortcutIcon.type = 'image/x-icon';
            document.head.appendChild(shortcutIcon);
        } else {
            shortcutIcon.href = `/favicon.ico?v=${timestamp}`;
        }
    }, []);

    useEffect(() => {
        setIsSearching(false);
        setLastDoc(null); // Reset pagination when category changes

        // Wrap the loadThreads call in a try-catch to prevent uncaught errors
        try {
            loadThreads(true);
        } catch (error) {
            console.error('Error in useEffect:', error);
            setError(error.message);
            setLoading(false);
        }
    }, [selectedCategory]); // Remove loadThreads from dependencies

    const handleSearch = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!searchTerm || !searchTerm.trim()) {
            setIsSearching(false);
            setSearchTerm('');
            loadThreads(true);
            return;
        }

        setLoading(true);
        setIsSearching(true);
        setError(null);

        try {
            const result = await searchThreads(searchTerm.trim(), selectedCategory);

            if (result.success) {
                setThreads(result.threads);
                setHasMore(false);
            } else {
                console.error("Failed to search threads:", result.error);
                setError(result.error || 'Search failed');
            }
        } catch (error) {
            console.error('Error searching threads:', error);
            setError(error.message || 'An error occurred during search');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSearch();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
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
                    <h1>Community Forums</h1>
                    <p>Join the conversation and connect with fellow learners</p>
                </div>
                <button className="create-thread-btn" onClick={handleCreateThread}>
                    {user ? 'Start New Discussion' : 'Login to Post'}
                </button>
            </div>

            <div className="forum-controls">
                <div className="search-section-header">
                    <h3>🔍 Search Discussions</h3>
                </div>
                <div className="search-form">
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="search-input"
                    />
                    <button type="button" onClick={handleSearchClick} className="search-btn">🔍</button>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setIsSearching(false);
                                loadThreads(true);
                            }}
                            className="search-btn"
                            style={{ marginLeft: '5px' }}
                        >
                            ✕
                        </button>
                    )}
                </div>

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

const Forums = () => (
    <ForumsErrorBoundary>
        <ForumsComponent />
    </ForumsErrorBoundary>
);

export default Forums;
