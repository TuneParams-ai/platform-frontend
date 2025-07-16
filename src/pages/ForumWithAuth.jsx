import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABELS } from '../services/forumService';
import '../styles/forum.css';

const ForumWithAuth = () => {
    console.log('ForumWithAuth component rendered');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreateThread = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        alert('Would open create thread modal');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        alert(`Would search for: ${searchTerm}`);
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
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>No discussions found</h3>
                    <p>Be the first to start a discussion!</p>
                    <button className="create-thread-btn" onClick={handleCreateThread}>
                        {user ? 'Start First Discussion' : 'Login to Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForumWithAuth;
