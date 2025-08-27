// src/components/AdminEmailTracking.jsx
// Component for admins to view email tracking data
import React, { useState, useEffect } from 'react';
import {
    getEmailStatistics,
    getEmailsByType,
    getEmailsByRecipient,
    searchEmails
} from '../services/emailTrackingService';
import '../styles/admin-email-tracking.css';

const AdminEmailTracking = () => {
    const [statistics, setStatistics] = useState(null);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('enrollment_confirmation');

    // Load email statistics on component mount
    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        setLoading(true);
        try {
            const result = await getEmailStatistics();
            if (result.success) {
                setStatistics(result.statistics);
            }
        } catch (error) {
            console.error('Error loading email statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadEmailsByType = async () => {
        setLoading(true);
        try {
            const result = await getEmailsByType(selectedType);
            if (result.success) {
                setEmails(result.emails);
            }
        } catch (error) {
            console.error('Error loading emails by type:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchByEmail = async () => {
        if (!searchEmail.trim()) return;

        setLoading(true);
        try {
            const result = await getEmailsByRecipient(searchEmail.trim());
            if (result.success) {
                setEmails(result.emails);
            }
        } catch (error) {
            console.error('Error searching emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const performGeneralSearch = async () => {
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            const result = await searchEmails(searchTerm.trim());
            if (result.success) {
                setEmails(result.emails);
            }
        } catch (error) {
            console.error('Error performing general search:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !statistics) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">
                    Loading email tracking data...
                </p>
            </div>
        );
    }

    return (
        <div className="email-tracking-container">
            <div className="email-tracking-card">
                <h2 className="email-tracking-title">
                    📧 Email Tracking Dashboard
                </h2>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    {[
                        { key: 'overview', label: 'Overview', icon: '📊' },
                        { key: 'search', label: 'Search Emails', icon: '🔍' },
                        { key: 'by-type', label: 'By Type', icon: '📝' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && statistics && (
                    <div>
                        <div className="stats-grid">
                            {[
                                { title: 'Total Emails', value: statistics.totalEmails, color: '#667eea', icon: '📧' },
                                { title: 'Sent Successfully', value: statistics.sentSuccessfully, color: '#10b981', icon: '✅' },
                                { title: 'Failed', value: statistics.failed, color: '#ef4444', icon: '❌' },
                                { title: 'Success Rate', value: `${statistics.successRate}%`, color: '#06b6d4', icon: '📊' }
                            ].map((stat, index) => (
                                <div key={index} className="stat-card">
                                    <div className="stat-icon">{stat.icon}</div>
                                    <h3 className="stat-title">
                                        {stat.title}
                                    </h3>
                                    <p className="stat-value" style={{ color: stat.color }}>
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="overview-grid">
                            <div className="overview-card">
                                <h3 className="overview-card-title">
                                    📧 Email Types
                                </h3>
                                {Object.entries(statistics.emailTypes).map(([type, count]) => (
                                    <div key={type} className="overview-list-item">
                                        <span className="overview-item-label">
                                            {type.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <div className="overview-badge primary">
                                            {count}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="overview-card">
                                <h3 className="overview-card-title">
                                    📚 Course Emails
                                </h3>
                                {Object.entries(statistics.courses).map(([courseKey, count]) => {
                                    const courseName = courseKey.split('_').slice(1).join('_');
                                    return (
                                        <div key={courseKey} className="overview-list-item">
                                            <span className="overview-item-label overview-item-truncate">
                                                {courseName}
                                            </span>
                                            <div className="overview-badge success">
                                                {count}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <div>
                        <div className="search-section">
                            <h3 className="search-title">
                                📧 Search by Email Address
                            </h3>
                            <div className="search-form">
                                <div className="form-group">
                                    <label className="form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter email address to search..."
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <button
                                    onClick={searchByEmail}
                                    disabled={loading}
                                    className="search-button primary"
                                >
                                    {loading ? 'Searching...' : '🔍 Search by Email'}
                                </button>
                            </div>
                        </div>

                        <div className="search-section">
                            <h3 className="search-title">
                                🔍 General Search
                            </h3>
                            <div className="search-form">
                                <div className="form-group">
                                    <label className="form-label">
                                        Search Term
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search by name, course, payment ID, etc..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input general-search-input"
                                    />
                                </div>
                                <button
                                    onClick={performGeneralSearch}
                                    disabled={loading}
                                    className="search-button success"
                                >
                                    {loading ? 'Searching...' : '🔍 General Search'}
                                </button>
                            </div>
                        </div>

                        {emails.length > 0 ? (
                            <div>
                                <h3 className="search-results-title">
                                    🎯 Search Results ({emails.length})
                                </h3>
                                <EmailTable emails={emails} formatDate={formatDate} />
                            </div>
                        ) : searchEmail.trim() || searchTerm.trim() ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔍</div>
                                <h3 className="empty-state-title">
                                    No emails found
                                </h3>
                                <p className="empty-state-text">
                                    Try adjusting your search terms or check if the email address is correct.
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* By Type Tab */}
                {activeTab === 'by-type' && (
                    <div>
                        <div className="search-section">
                            <h3 className="search-title">
                                📝 Filter by Email Type
                            </h3>
                            <div className="search-form">
                                <div className="form-group-small">
                                    <label className="form-label">
                                        Email Type
                                    </label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="enrollment_confirmation">📧 Enrollment Confirmation</option>
                                        <option value="course_reminder">⏰ Course Reminder</option>
                                        <option value="payment_receipt">🧾 Payment Receipt</option>
                                    </select>
                                </div>
                                <button
                                    onClick={loadEmailsByType}
                                    disabled={loading}
                                    className="search-button primary"
                                >
                                    {loading ? 'Loading...' : '📊 Load Emails'}
                                </button>
                            </div>
                        </div>

                        {emails.length > 0 ? (
                            <div>
                                <h3 className="search-results-title">
                                    📋 {selectedType.replace('_', ' ').toUpperCase()} Emails ({emails.length})
                                </h3>
                                <EmailTable emails={emails} formatDate={formatDate} />
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📧</div>
                                <h3 className="empty-state-title">
                                    No {selectedType.replace('_', ' ')} emails found
                                </h3>
                                <p className="empty-state-text">
                                    Click "Load Emails" to fetch emails of this type.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Email table component
const EmailTable = ({ emails, formatDate }) => {
    const [expandedEmail, setExpandedEmail] = React.useState(null);

    const toggleEmailDetails = (emailId) => {
        setExpandedEmail(expandedEmail === emailId ? null : emailId);
    };

    return (
        <div className="email-table-container">
            <div style={{ overflowX: 'auto' }}>
                <table className="email-table">
                    <thead className="email-table-header">
                        <tr>
                            <th className="email-table-header-cell">📅 Date</th>
                            <th className="email-table-header-cell">👤 Recipient</th>
                            <th className="email-table-header-cell">📧 Type</th>
                            <th className="email-table-header-cell">📚 Course</th>
                            <th className="email-table-header-cell">✅ Status</th>
                            <th className="email-table-header-cell">💳 Payment ID</th>
                            <th className="email-table-header-cell-center">⚙️ Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emails.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty-state">
                                    <div className="table-empty-content">
                                        <div className="table-empty-icon">📧</div>
                                        <h3 className="table-empty-title">
                                            No emails to display
                                        </h3>
                                        <p className="table-empty-text">
                                            Emails will appear here once they are sent through the system.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            emails.map((email, index) => (
                                <React.Fragment key={email.id}>
                                    <tr className={`email-table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                                        <td className="email-table-cell">
                                            <div className="cell-date">
                                                {formatDate(email.sentAt)}
                                            </div>
                                        </td>
                                        <td className="email-table-cell">
                                            <div className="cell-recipient">
                                                <div className="recipient-name">
                                                    {email.recipientName || 'N/A'}
                                                </div>
                                                <div className="recipient-email">
                                                    {email.recipientEmail}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="email-table-cell">
                                            <span className={`email-type-badge ${email.emailType === 'enrollment_confirmation' ? 'enrollment' : 'other'}`}>
                                                {email.emailType?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="email-table-cell">
                                            <div className="cell-course">
                                                <div className="course-title">
                                                    {email.courseTitle || 'N/A'}
                                                </div>
                                                {email.amount && (
                                                    <div className="course-amount">
                                                        ${email.amount}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="email-table-cell">
                                            <div className="cell-status">
                                                <span className={`status-badge ${email.status === 'sent' ? 'success' : 'error'}`}>
                                                    {email.status}
                                                </span>
                                                {email.errorMessage && (
                                                    <div className="error-message">
                                                        {email.errorMessage}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="email-table-cell payment-id-cell">
                                            <div className="payment-id">
                                                {email.paymentId ? email.paymentId.substring(0, 12) + '...' : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="email-table-cell actions-cell">
                                            <button
                                                onClick={() => toggleEmailDetails(email.id)}
                                                className={`action-button ${expandedEmail === email.id ? 'hide' : 'view'}`}
                                            >
                                                {expandedEmail === email.id ? '🙈 Hide' : '👁️ View'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedEmail === email.id && (
                                        <tr>
                                            <td colSpan="7" className="email-details-section">
                                                <div className="email-details-content">
                                                    <h4 className="email-details-title">
                                                        📋 Email Details
                                                    </h4>

                                                    <div className="email-details-grid">
                                                        <div className="email-detail-card">
                                                            <div className="detail-label">📧 Subject</div>
                                                            <div className="detail-value">{email.subject || 'N/A'}</div>
                                                        </div>
                                                        <div className="email-detail-card">
                                                            <div className="detail-label">🛒 Order ID</div>
                                                            <div className="detail-value detail-code">
                                                                {email.orderId || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div className="email-detail-card">
                                                            <div className="detail-label">🎓 Enrollment ID</div>
                                                            <div className="detail-value detail-code">
                                                                {email.enrollmentId || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div className="email-detail-card">
                                                            <div className="detail-label">🔧 Service Response</div>
                                                            <div className="detail-value detail-small">
                                                                {email.emailServiceResponse || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {email.rawTextContent && (
                                                        <div className="email-content-section">
                                                            <div className="email-detail-card">
                                                                <div className="email-content-header">
                                                                    📝 Email Content
                                                                </div>
                                                                <div className="email-content-viewer">
                                                                    <pre className="email-content-pre">
                                                                        {email.rawTextContent}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminEmailTracking;
