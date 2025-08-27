// src/components/AdminEmailTracking.jsx
// Component for admins to view email tracking data
import React, { useState, useEffect } from 'react';
import {
    getEmailStatistics,
    getEmailsByType,
    getEmailsByRecipient
} from '../services/emailTrackingService';

const AdminEmailTracking = () => {
    const [statistics, setStatistics] = useState(null);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchEmail, setSearchEmail] = useState('');
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
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading email tracking data...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>📧 Email Tracking Dashboard</h2>

            {/* Tab Navigation */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        border: 'none',
                        background: activeTab === 'overview' ? '#667eea' : 'transparent',
                        color: activeTab === 'overview' ? 'white' : '#333',
                        cursor: 'pointer'
                    }}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        border: 'none',
                        background: activeTab === 'search' ? '#667eea' : 'transparent',
                        color: activeTab === 'search' ? 'white' : '#333',
                        cursor: 'pointer'
                    }}
                >
                    Search Emails
                </button>
                <button
                    onClick={() => setActiveTab('by-type')}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        background: activeTab === 'by-type' ? '#667eea' : 'transparent',
                        color: activeTab === 'by-type' ? 'white' : '#333',
                        cursor: 'pointer'
                    }}
                >
                    By Type
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && statistics && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Emails</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#667eea' }}>
                                {statistics.totalEmails}
                            </p>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Sent Successfully</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#28a745' }}>
                                {statistics.sentSuccessfully}
                            </p>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Failed</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#dc3545' }}>
                                {statistics.failed}
                            </p>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Success Rate</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#17a2b8' }}>
                                {statistics.successRate}%
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                            <h3>📧 Email Types</h3>
                            {Object.entries(statistics.emailTypes).map(([type, count]) => (
                                <div key={type} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{type.replace('_', ' ').toUpperCase()}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                            <h3>📚 Course Emails</h3>
                            {Object.entries(statistics.courses).map(([courseKey, count]) => {
                                const courseName = courseKey.split('_').slice(1).join('_');
                                return (
                                    <div key={courseKey} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '14px' }}>{courseName}</span>
                                        <strong>{count}</strong>
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
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="email"
                            placeholder="Enter email address to search..."
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            style={{
                                padding: '10px',
                                marginRight: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                width: '300px'
                            }}
                        />
                        <button
                            onClick={searchByEmail}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {emails.length > 0 && (
                        <div>
                            <h3>Search Results ({emails.length})</h3>
                            <EmailTable emails={emails} formatDate={formatDate} />
                        </div>
                    )}
                </div>
            )}

            {/* By Type Tab */}
            {activeTab === 'by-type' && (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            style={{
                                padding: '10px',
                                marginRight: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="enrollment_confirmation">Enrollment Confirmation</option>
                            <option value="course_reminder">Course Reminder</option>
                            <option value="payment_receipt">Payment Receipt</option>
                        </select>
                        <button
                            onClick={loadEmailsByType}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Loading...' : 'Load Emails'}
                        </button>
                    </div>

                    {emails.length > 0 && (
                        <div>
                            <h3>{selectedType.replace('_', ' ').toUpperCase()} Emails ({emails.length})</h3>
                            <EmailTable emails={emails} formatDate={formatDate} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Email table component
const EmailTable = ({ emails, formatDate }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ background: '#f8f9fa' }}>
                <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Recipient</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Course</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Payment ID</th>
                </tr>
            </thead>
            <tbody>
                {emails.map((email) => (
                    <tr key={email.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{formatDate(email.sentAt)}</td>
                        <td style={{ padding: '12px' }}>
                            <div>
                                <strong>{email.recipientName || 'N/A'}</strong>
                                <br />
                                <small style={{ color: '#666' }}>{email.recipientEmail}</small>
                            </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                            <span style={{
                                background: email.emailType === 'enrollment_confirmation' ? '#e3f2fd' : '#f3e5f5',
                                color: email.emailType === 'enrollment_confirmation' ? '#1976d2' : '#7b1fa2',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}>
                                {email.emailType?.replace('_', ' ').toUpperCase()}
                            </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                            <div>
                                <strong>{email.courseTitle || 'N/A'}</strong>
                                {email.amount && (
                                    <div>
                                        <small style={{ color: '#666' }}>${email.amount}</small>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                            <span style={{
                                background: email.status === 'sent' ? '#d4edda' : '#f8d7da',
                                color: email.status === 'sent' ? '#155724' : '#721c24',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}>
                                {email.status?.toUpperCase()}
                            </span>
                            {email.errorMessage && (
                                <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '4px' }}>
                                    {email.errorMessage}
                                </div>
                            )}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                            {email.paymentId || 'N/A'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default AdminEmailTracking;
