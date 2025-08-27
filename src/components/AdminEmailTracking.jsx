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
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #f3f4f6',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{
                    color: '#6b7280',
                    fontSize: '16px',
                    fontWeight: '500'
                }}>
                    Loading email tracking data...
                </p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
            background: '#f8fafc',
            minHeight: '100vh'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                marginBottom: '24px'
            }}>
                <h2 style={{
                    margin: '0 0 32px 0',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    📧 Email Tracking Dashboard
                </h2>

                {/* Tab Navigation */}
                <div style={{
                    marginBottom: '32px',
                    borderBottom: '2px solid #e5e7eb',
                    display: 'flex',
                    gap: '4px'
                }}>
                    {[
                        { key: 'overview', label: 'Overview', icon: '📊' },
                        { key: 'search', label: 'Search Emails', icon: '🔍' },
                        { key: 'by-type', label: 'By Type', icon: '📝' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: activeTab === tab.key ? '#667eea' : 'transparent',
                                color: activeTab === tab.key ? 'white' : '#6b7280',
                                cursor: 'pointer',
                                borderRadius: '8px 8px 0 0',
                                fontWeight: activeTab === tab.key ? '600' : '500',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '-2px',
                                borderBottom: activeTab === tab.key ? '2px solid #667eea' : '2px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab.key) {
                                    e.target.style.background = '#f3f4f6';
                                    e.target.style.color = '#374151';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab.key) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#6b7280';
                                }
                            }}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && statistics && (
                    <div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '24px',
                            marginBottom: '40px'
                        }}>
                            {[
                                { title: 'Total Emails', value: statistics.totalEmails, color: '#667eea', icon: '📧' },
                                { title: 'Sent Successfully', value: statistics.sentSuccessfully, color: '#10b981', icon: '✅' },
                                { title: 'Failed', value: statistics.failed, color: '#ef4444', icon: '❌' },
                                { title: 'Success Rate', value: `${statistics.successRate}%`, color: '#06b6d4', icon: '📊' }
                            ].map((stat, index) => (
                                <div key={index} style={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    padding: '28px',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                                    }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
                                    <h3 style={{
                                        margin: '0 0 16px 0',
                                        color: '#374151',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        lineHeight: '1.5'
                                    }}>
                                        {stat.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '36px',
                                        fontWeight: '800',
                                        margin: '0',
                                        color: stat.color,
                                        lineHeight: '1'
                                    }}>
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                padding: '32px',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                            }}>
                                <h3 style={{
                                    margin: '0 0 24px 0',
                                    color: '#1f2937',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    📧 Email Types
                                </h3>
                                {Object.entries(statistics.emailTypes).map(([type, count]) => (
                                    <div key={type} style={{
                                        marginBottom: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 0',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <span style={{
                                            color: '#4b5563',
                                            fontSize: '15px',
                                            fontWeight: '500'
                                        }}>
                                            {type.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <div style={{
                                            background: '#667eea',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            minWidth: '32px',
                                            textAlign: 'center'
                                        }}>
                                            {count}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                padding: '32px',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                            }}>
                                <h3 style={{
                                    margin: '0 0 24px 0',
                                    color: '#1f2937',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    📚 Course Emails
                                </h3>
                                {Object.entries(statistics.courses).map(([courseKey, count]) => {
                                    const courseName = courseKey.split('_').slice(1).join('_');
                                    return (
                                        <div key={courseKey} style={{
                                            marginBottom: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 0',
                                            borderBottom: '1px solid #f1f5f9'
                                        }}>
                                            <span style={{
                                                fontSize: '15px',
                                                color: '#4b5563',
                                                fontWeight: '500',
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {courseName}
                                            </span>
                                            <div style={{
                                                background: '#10b981',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                minWidth: '32px',
                                                textAlign: 'center'
                                            }}>
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
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            padding: '32px',
                            borderRadius: '16px',
                            marginBottom: '32px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <h3 style={{
                                margin: '0 0 24px 0',
                                color: '#1f2937',
                                fontSize: '20px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📧 Search by Email Address
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1', minWidth: '300px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter email address to search..."
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                                <button
                                    onClick={searchByEmail}
                                    disabled={loading}
                                    style={{
                                        padding: '12px 24px',
                                        background: loading ? '#9ca3af' : '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'background-color 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) e.target.style.background = '#5a67d8';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading) e.target.style.background = '#667eea';
                                    }}
                                >
                                    {loading ? 'Searching...' : '🔍 Search by Email'}
                                </button>
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            padding: '32px',
                            borderRadius: '16px',
                            marginBottom: '32px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <h3 style={{
                                margin: '0 0 24px 0',
                                color: '#1f2937',
                                fontSize: '20px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🔍 General Search
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1', minWidth: '300px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Search Term
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search by name, course, payment ID, etc..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                                <button
                                    onClick={performGeneralSearch}
                                    disabled={loading}
                                    style={{
                                        padding: '12px 24px',
                                        background: loading ? '#9ca3af' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'background-color 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) e.target.style.background = '#059669';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading) e.target.style.background = '#10b981';
                                    }}
                                >
                                    {loading ? 'Searching...' : '🔍 General Search'}
                                </button>
                            </div>
                        </div>

                        {emails.length > 0 ? (
                            <div>
                                <h3 style={{
                                    margin: '0 0 24px 0',
                                    color: '#1f2937',
                                    fontSize: '24px',
                                    fontWeight: '700'
                                }}>
                                    🎯 Search Results ({emails.length})
                                </h3>
                                <EmailTable emails={emails} formatDate={formatDate} />
                            </div>
                        ) : searchEmail.trim() || searchTerm.trim() ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 24px',
                                background: 'white',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                <h3 style={{
                                    color: '#374151',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    No emails found
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    margin: '0'
                                }}>
                                    Try adjusting your search terms or check if the email address is correct.
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* By Type Tab */}
                {activeTab === 'by-type' && (
                    <div>
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            padding: '32px',
                            borderRadius: '16px',
                            marginBottom: '32px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <h3 style={{
                                margin: '0 0 24px 0',
                                color: '#1f2937',
                                fontSize: '20px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📝 Filter by Email Type
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ minWidth: '200px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Email Type
                                    </label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        style={{
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            background: 'white',
                                            minWidth: '200px'
                                        }}
                                    >
                                        <option value="enrollment_confirmation">📧 Enrollment Confirmation</option>
                                        <option value="course_reminder">⏰ Course Reminder</option>
                                        <option value="payment_receipt">🧾 Payment Receipt</option>
                                    </select>
                                </div>
                                <button
                                    onClick={loadEmailsByType}
                                    disabled={loading}
                                    style={{
                                        padding: '12px 24px',
                                        background: loading ? '#9ca3af' : '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        transition: 'background-color 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) e.target.style.background = '#5a67d8';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading) e.target.style.background = '#667eea';
                                    }}
                                >
                                    {loading ? 'Loading...' : '📊 Load Emails'}
                                </button>
                            </div>
                        </div>

                        {emails.length > 0 ? (
                            <div>
                                <h3 style={{
                                    margin: '0 0 24px 0',
                                    color: '#1f2937',
                                    fontSize: '24px',
                                    fontWeight: '700'
                                }}>
                                    📋 {selectedType.replace('_', ' ').toUpperCase()} Emails ({emails.length})
                                </h3>
                                <EmailTable emails={emails} formatDate={formatDate} />
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px 24px',
                                background: 'white',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                                <h3 style={{
                                    color: '#374151',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    No {selectedType.replace('_', ' ')} emails found
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    margin: '0'
                                }}>
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
        <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                }}>
                    <thead style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <tr>
                            <th style={{
                                padding: '20px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                letterSpacing: '0.05em'
                            }}>📅 Date</th>
                            <th style={{
                                padding: '20px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                letterSpacing: '0.05em'
                            }}>👤 Recipient</th>
                            <th style={{
                                padding: '20px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                letterSpacing: '0.05em'
                            }}>📧 Type</th>
                            <th style={{
                                padding: '20px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                letterSpacing: '0.05em'
                            }}>📚 Course</th>
                            <th style={{
                                padding: '20px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                letterSpacing: '0.05em'
                            }}>✅ Status</th>
                            <th style={{
                                padding: '20px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                letterSpacing: '0.05em'
                            }}>💳 Payment ID</th>
                            <th style={{
                                padding: '20px 16px',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '14px',
                                letterSpacing: '0.05em'
                            }}>⚙️ Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emails.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{
                                    padding: '48px 24px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
                                    <h3 style={{
                                        color: '#374151',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        marginBottom: '8px'
                                    }}>
                                        No emails to display
                                    </h3>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        margin: '0'
                                    }}>
                                        Emails will appear here once they are sent through the system.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            emails.map((email, index) => (
                                <React.Fragment key={email.id}>
                                    <tr style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f0f9ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                                        }}>
                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#374151'
                                            }}>
                                                {formatDate(email.sentAt)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                            <div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#1f2937',
                                                    marginBottom: '4px'
                                                }}>
                                                    {email.recipientName || 'N/A'}
                                                </div>
                                                <div style={{
                                                    color: '#6b7280',
                                                    fontSize: '13px'
                                                }}>
                                                    {email.recipientEmail}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                            <span style={{
                                                background: email.emailType === 'enrollment_confirmation'
                                                    ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                                                    : 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)',
                                                color: email.emailType === 'enrollment_confirmation' ? '#1e40af' : '#7c2d12',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                border: `1px solid ${email.emailType === 'enrollment_confirmation' ? '#93c5fd' : '#d8b4fe'}`
                                            }}>
                                                {email.emailType?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                            <div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#1f2937',
                                                    marginBottom: '4px'
                                                }}>
                                                    {email.courseTitle || 'N/A'}
                                                </div>
                                                {email.amount && (
                                                    <div style={{
                                                        background: '#f0fdf4',
                                                        color: '#166534',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        display: 'inline-block',
                                                        border: '1px solid #bbf7d0'
                                                    }}>
                                                        ${email.amount}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                            <div>
                                                <span style={{
                                                    background: email.status === 'sent'
                                                        ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                                                        : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                                    color: email.status === 'sent' ? '#065f46' : '#991b1b',
                                                    padding: '8px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    border: `1px solid ${email.status === 'sent' ? '#6ee7b7' : '#f87171'}`
                                                }}>
                                                    {email.status}
                                                </span>
                                                {email.errorMessage && (
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#dc2626',
                                                        marginTop: '8px',
                                                        background: '#fef2f2',
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #fecaca'
                                                    }}>
                                                        {email.errorMessage}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '16px',
                                            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                            fontSize: '12px',
                                            verticalAlign: 'top'
                                        }}>
                                            <div style={{
                                                background: '#f3f4f6',
                                                padding: '8px',
                                                borderRadius: '6px',
                                                color: '#374151',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                {email.paymentId ? email.paymentId.substring(0, 12) + '...' : 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                            <button
                                                onClick={() => toggleEmailDetails(email.id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: expandedEmail === email.id
                                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-1px)';
                                                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                                                }}
                                            >
                                                {expandedEmail === email.id ? '🙈 Hide' : '👁️ View'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedEmail === email.id && (
                                        <tr>
                                            <td colSpan="7" style={{
                                                padding: '0',
                                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                                borderBottom: '2px solid #e2e8f0'
                                            }}>
                                                <div style={{ padding: '32px' }}>
                                                    <h4 style={{
                                                        margin: '0 0 24px 0',
                                                        color: '#1f2937',
                                                        fontSize: '20px',
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        📋 Email Details
                                                    </h4>

                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                        gap: '24px',
                                                        marginBottom: '32px'
                                                    }}>
                                                        <div style={{
                                                            background: 'white',
                                                            padding: '20px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                                        }}>
                                                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>📧 Subject</div>
                                                            <div style={{ color: '#6b7280' }}>{email.subject || 'N/A'}</div>
                                                        </div>
                                                        <div style={{
                                                            background: 'white',
                                                            padding: '20px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                                        }}>
                                                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>🛒 Order ID</div>
                                                            <div style={{
                                                                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                                                color: '#6b7280',
                                                                fontSize: '13px'
                                                            }}>
                                                                {email.orderId || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            background: 'white',
                                                            padding: '20px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                                        }}>
                                                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>🎓 Enrollment ID</div>
                                                            <div style={{
                                                                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                                                color: '#6b7280',
                                                                fontSize: '13px'
                                                            }}>
                                                                {email.enrollmentId || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            background: 'white',
                                                            padding: '20px',
                                                            borderRadius: '12px',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                                        }}>
                                                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>🔧 Service Response</div>
                                                            <div style={{
                                                                color: '#6b7280',
                                                                fontSize: '13px'
                                                            }}>
                                                                {email.emailServiceResponse || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {email.rawTextContent && (
                                                        <div style={{ display: 'grid', gap: '24px' }}>
                                                            <div style={{
                                                                background: 'white',
                                                                padding: '24px',
                                                                borderRadius: '12px',
                                                                border: '1px solid #e2e8f0',
                                                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                                            }}>
                                                                <div style={{
                                                                    fontWeight: '600',
                                                                    color: '#374151',
                                                                    marginBottom: '16px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px'
                                                                }}>
                                                                    📝 Email Content
                                                                </div>
                                                                <div style={{
                                                                    maxHeight: '300px',
                                                                    overflow: 'auto',
                                                                    background: '#f8fafc',
                                                                    padding: '16px',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '8px',
                                                                    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                                                    fontSize: '12px',
                                                                    lineHeight: '1.5'
                                                                }}>
                                                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
