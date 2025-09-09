// src/components/AdminSearchPanel.jsx
// Advanced search component for admin dashboard
import React, { useState, useEffect } from 'react';
import {
    searchUsers,
    searchCoupons,
    searchEmails,
    searchEnrollments,
    searchPayments,
    globalSearch
} from '../services/searchService';
import '../styles/admin-search-panel.css';

const AdminSearchPanel = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('global');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({});

    // Search options
    const searchTypes = [
        { value: 'global', label: 'All Collections', icon: '🌐' },
        { value: 'users', label: 'Users', icon: '👥' },
        { value: 'coupons', label: 'Coupons', icon: '🎫' },
        { value: 'emails', label: 'Emails', icon: '📧' },
        { value: 'enrollments', label: 'Enrollments', icon: '📚' },
        { value: 'payments', label: 'Payments', icon: '💳' }
    ];

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError('');

        try {
            let result;

            switch (searchType) {
                case 'global':
                    result = await globalSearch(searchTerm);
                    break;
                case 'users':
                    result = await searchUsers(searchTerm, { filters });
                    break;
                case 'coupons':
                    result = await searchCoupons(searchTerm, { filters });
                    break;
                case 'emails':
                    result = await searchEmails(searchTerm, { filters });
                    break;
                case 'enrollments':
                    result = await searchEnrollments(searchTerm, { filters });
                    break;
                case 'payments':
                    result = await searchPayments(searchTerm, { filters });
                    break;
                default:
                    result = { success: false, error: 'Invalid search type' };
            }

            if (result.success) {
                setSearchResults(searchType === 'global' ? result.results : [result]);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Search failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, searchType, filters]);

    const renderResults = () => {
        if (loading) {
            return (
                <div className="search-loading">
                    <div className="spinner"></div>
                    <p>Searching...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="search-error">
                    <p>❌ {error}</p>
                </div>
            );
        }

        if (searchResults.length === 0 && searchTerm.trim()) {
            return (
                <div className="search-empty">
                    <p>🔍 No results found for "{searchTerm}"</p>
                </div>
            );
        }

        return (
            <div className="search-results">
                {searchResults.map((collectionResult, index) => (
                    <div key={index} className="collection-results">
                        {searchType === 'global' && (
                            <h3 className="collection-title">
                                {getCollectionIcon(collectionResult.collection)}
                                {formatCollectionName(collectionResult.collection)}
                                <span className="result-count">({collectionResult.totalCount})</span>
                            </h3>
                        )}

                        <div className="results-grid">
                            {collectionResult.results.map((item) => (
                                <div key={item.id} className="result-card">
                                    {renderResultCard(item, collectionResult.collection || searchType)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderResultCard = (item, collection) => {
        switch (collection) {
            case 'users':
                return (
                    <div className="user-card">
                        <div className="card-header">
                            <span className="card-type">👤 User</span>
                            <span className="card-id">{item.id}</span>
                        </div>
                        <h4>{item.displayName || item.email}</h4>
                        <p>📧 {item.email}</p>
                        {item.createdAt && (
                            <p>📅 Joined: {new Date(item.createdAt.toDate()).toLocaleDateString()}</p>
                        )}
                    </div>
                );

            case 'coupons':
                return (
                    <div className="coupon-card">
                        <div className="card-header">
                            <span className="card-type">🎫 Coupon</span>
                            <span className={`status-badge status-${item.status}`}>{item.status}</span>
                        </div>
                        <h4>{item.code}</h4>
                        <p>{item.name}</p>
                        <p>💰 {item.discountType === 'percentage' ? `${item.discountValue}%` : `$${item.discountValue}`} off</p>
                        <p>🎯 {item.targetType}</p>
                    </div>
                );

            case 'emails_sent':
                return (
                    <div className="email-card">
                        <div className="card-header">
                            <span className="card-type">📧 Email</span>
                            <span className={`status-badge status-${item.status}`}>{item.status}</span>
                        </div>
                        <h4>{item.subject}</h4>
                        <p>📧 To: {item.recipientEmail}</p>
                        <p>📝 Type: {item.emailType}</p>
                        {item.sentAt && (
                            <p>📅 Sent: {new Date(item.sentAt.toDate()).toLocaleDateString()}</p>
                        )}
                    </div>
                );

            case 'enrollments':
                return (
                    <div className="enrollment-card">
                        <div className="card-header">
                            <span className="card-type">📚 Enrollment</span>
                            <span className="card-id">{item.id}</span>
                        </div>
                        <h4>{item.courseTitle || item.courseId}</h4>
                        <p>👤 {item.userName || item.userEmail}</p>
                        <p>🎓 Batch: {item.batchNumber}</p>
                        {item.enrolledAt && (
                            <p>📅 Enrolled: {new Date(item.enrolledAt.toDate()).toLocaleDateString()}</p>
                        )}
                    </div>
                );

            case 'payments':
                return (
                    <div className="payment-card">
                        <div className="card-header">
                            <span className="card-type">💳 Payment</span>
                            <span className={`status-badge status-${item.status}`}>{item.status}</span>
                        </div>
                        <h4>${item.amount}</h4>
                        <p>👤 {item.userEmail}</p>
                        <p>📚 {item.courseTitle || item.courseId}</p>
                        <p>🆔 {item.paymentId}</p>
                        {item.createdAt && (
                            <p>📅 {new Date(item.createdAt.toDate()).toLocaleDateString()}</p>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="generic-card">
                        <div className="card-header">
                            <span className="card-type">📄 {collection}</span>
                            <span className="card-id">{item.id}</span>
                        </div>
                        <pre>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                );
        }
    };

    const getCollectionIcon = (collection) => {
        const icons = {
            users: '👥',
            coupons: '🎫',
            emails_sent: '📧',
            enrollments: '📚',
            payments: '💳',
            forum_threads: '💬'
        };
        return icons[collection] || '📄';
    };

    const formatCollectionName = (collection) => {
        const names = {
            users: 'Users',
            coupons: 'Coupons',
            emails_sent: 'Emails',
            enrollments: 'Enrollments',
            payments: 'Payments',
            forum_threads: 'Forum Threads'
        };
        return names[collection] || collection;
    };

    return (
        <div className="admin-search-panel">
            <div className="search-header">
                <h2>🔍 Advanced Search</h2>
                <p>Search across all your Firebase collections</p>
            </div>

            <div className="search-controls">
                <div className="search-input-group">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for users, coupons, emails, payments..."
                        className="search-input"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="search-button"
                    >
                        {loading ? '🔄' : '🔍'}
                    </button>
                </div>

                <div className="search-type-selector">
                    {searchTypes.map((type) => (
                        <button
                            key={type.value}
                            onClick={() => setSearchType(type.value)}
                            className={`search-type-btn ${searchType === type.value ? 'active' : ''}`}
                        >
                            {type.icon} {type.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="search-content">
                {renderResults()}
            </div>
        </div>
    );
};

export default AdminSearchPanel;
