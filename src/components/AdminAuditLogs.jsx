// src/components/AdminAuditLogs.jsx
// Admin component for viewing and managing audit logs
import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs, getAuditStats, exportAuditLogs } from '../services/auditService';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        action: '',
        resource: '',
        userId: '',
        startDate: '',
        endDate: '',
        limit: 50
    });

    const loadAuditLogs = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getAuditLogs(filters);
            if (result.success) {
                setLogs(result.logs);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadAuditLogs();
        loadAuditStats();
    }, [loadAuditLogs]);

    const loadAuditStats = async () => {
        try {
            const result = await getAuditStats();
            if (result.success) {
                setStats(result.stats);
            }
        } catch (err) {
            console.error('Failed to load audit stats:', err);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        loadAuditLogs();
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            resource: '',
            userId: '',
            startDate: '',
            endDate: '',
            limit: 50
        });
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            const exportData = await exportAuditLogs(filters);

            // Create download
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            setError('Failed to export audit logs');
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString();
        } catch (err) {
            return 'Invalid Date';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'create': return '#10b981';
            case 'update': return '#f59e0b';
            case 'delete': return '#ef4444';
            case 'login_success': return '#3b82f6';
            case 'login_failure': return '#ef4444';
            case 'payment_success': return '#10b981';
            case 'payment_failure': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="admin-audit-logs">
            <div className="audit-header">
                <h2>🔍 Audit Logs</h2>
                <button
                    className="export-btn"
                    onClick={handleExport}
                    disabled={loading || logs.length === 0}
                >
                    📥 Export Logs
                </button>
            </div>

            {/* Statistics Summary */}
            {stats && (
                <div className="audit-stats">
                    <div className="stat-card">
                        <h4>Total Events</h4>
                        <span className="stat-number">{stats.totalEvents}</span>
                    </div>
                    <div className="stat-card">
                        <h4>Top Actions</h4>
                        <div className="stat-list">
                            {Object.entries(stats.actionCounts)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 3)
                                .map(([action, count]) => (
                                    <div key={action} className="stat-item">
                                        <span>{action}</span>
                                        <span>{count}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="stat-card">
                        <h4>Top Resources</h4>
                        <div className="stat-list">
                            {Object.entries(stats.resourceCounts)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 3)
                                .map(([resource, count]) => (
                                    <div key={resource} className="stat-item">
                                        <span>{resource}</span>
                                        <span>{count}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="audit-filters">
                <div className="filter-row">
                    <select
                        value={filters.action}
                        onChange={(e) => handleFilterChange('action', e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="login_success">Login Success</option>
                        <option value="login_failure">Login Failure</option>
                        <option value="payment_success">Payment Success</option>
                        <option value="payment_failure">Payment Failure</option>
                    </select>

                    <select
                        value={filters.resource}
                        onChange={(e) => handleFilterChange('resource', e.target.value)}
                    >
                        <option value="">All Resources</option>
                        <option value="user">User</option>
                        <option value="enrollment">Enrollment</option>
                        <option value="payment">Payment</option>
                        <option value="coupon">Coupon</option>
                        <option value="review">Review</option>
                        <option value="auth">Authentication</option>
                    </select>

                    <input
                        type="text"
                        placeholder="User ID"
                        value={filters.userId}
                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                    />

                    <input
                        type="date"
                        placeholder="Start Date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />

                    <input
                        type="date"
                        placeholder="End Date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                </div>

                <div className="filter-actions">
                    <button onClick={applyFilters} disabled={loading}>
                        🔍 Apply Filters
                    </button>
                    <button onClick={clearFilters}>
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="audit-error">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="audit-loading">
                    Loading audit logs...
                </div>
            )}

            {/* Audit Logs Table */}
            {!loading && logs.length > 0 && (
                <div className="audit-logs-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>User</th>
                                <th>Description</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="timestamp">
                                        {formatTimestamp(log.timestamp || log.createdAt)}
                                    </td>
                                    <td>
                                        <span
                                            className="action-badge"
                                            style={{ backgroundColor: getActionColor(log.action) }}
                                        >
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="resource">
                                        {log.resource}
                                        {log.resourceId && (
                                            <small>({log.resourceId})</small>
                                        )}
                                    </td>
                                    <td className="user-info">
                                        <div>{log.userId || 'System'}</div>
                                        {log.userEmail && (
                                            <small>{log.userEmail}</small>
                                        )}
                                        {log.userRole && (
                                            <span className="role-badge">{log.userRole}</span>
                                        )}
                                    </td>
                                    <td className="description">
                                        {log.description}
                                    </td>
                                    <td className="details">
                                        {(log.newData || log.previousData || log.metadata) && (
                                            <button
                                                className="details-btn"
                                                onClick={() => {
                                                    console.log('Audit Log Details:', {
                                                        previous: log.previousData,
                                                        new: log.newData,
                                                        metadata: log.metadata
                                                    });
                                                    alert('Check console for detailed information');
                                                }}
                                            >
                                                📋 View
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && logs.length === 0 && !error && (
                <div className="no-logs">
                    No audit logs found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;