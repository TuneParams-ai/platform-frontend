// src/components/AdminBatchInfo.jsx
// Component for displaying batch information for admin users only
import React, { useState, useEffect } from 'react';
import { useUserRole } from '../hooks/useUserRole';
import { getCourseAllBatchStats, getNextAvailableBatchWithCount } from '../services/batchService';
import {
    getUpcomingBatches,
    getActiveBatches,
    formatBatchDateRange,
    getBatchStatusText,
    getBatchDisplayName,
    getBatchShortName
} from '../data/coursesData';

const AdminBatchInfo = ({ course, className = '' }) => {
    const { isAdminUser, loading: roleLoading } = useUserRole();
    const [batchStats, setBatchStats] = useState({});
    const [nextAvailableBatch, setNextAvailableBatch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load batch statistics
    useEffect(() => {
        const loadBatchStats = async () => {
            if (!course || !course.batches || !isAdminUser) return;

            setLoading(true);
            setError(null);

            try {
                // Get enrollment counts for all batches
                const statsResult = await getCourseAllBatchStats(course.id);
                if (statsResult.success) {
                    setBatchStats(statsResult.batchStats);
                } else {
                    setError(`Failed to load batch stats: ${statsResult.error}`);
                }

                // Get next available batch with current enrollment count
                const nextBatchResult = await getNextAvailableBatchWithCount(course.id);
                if (nextBatchResult.success) {
                    setNextAvailableBatch(nextBatchResult.batch);
                }

            } catch (err) {
                setError(`Error loading batch information: ${err.message}`);
                console.error('Error loading batch stats:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBatchStats();
    }, [course, isAdminUser]);

    // Don't render anything if user is not an admin or still loading role
    if (roleLoading || !isAdminUser || !course?.batches) {
        return null;
    }

    const upcomingBatches = getUpcomingBatches(course);
    const activeBatches = getActiveBatches(course);

    return (
        <div className={`admin-batch-info ${className}`}>
            <div className="admin-batch-header">
                <h3>📊 Batch Management (Admin Only)</h3>
                <div className="batch-summary">
                    <span className="batch-count">
                        Total: {course.batches.length}
                    </span>
                    <span className="batch-count">
                        Active: {activeBatches.length}
                    </span>
                    <span className="batch-count">
                        Upcoming: {upcomingBatches.length}
                    </span>
                </div>
            </div>

            {error && (
                <div className="admin-batch-error">
                    <p>⚠️ {error}</p>
                </div>
            )}

            {loading && (
                <div className="admin-batch-loading">
                    <p>Loading batch information...</p>
                </div>
            )}

            {/* Next Available Batch for New Enrollments */}
            {nextAvailableBatch && (
                <div className="next-enrollment-batch">
                    <h4>🎯 Auto-Enrollment Target</h4>
                    <div className="batch-card highlight">
                        <div className="batch-card-header">
                            <span className="batch-number" title={`Batch ${nextAvailableBatch.batchNumber}`}>
                                {getBatchDisplayName(nextAvailableBatch)}
                            </span>
                            <span className={`batch-status batch-status-${nextAvailableBatch.status}`}>
                                {getBatchStatusText(nextAvailableBatch)}
                            </span>
                        </div>
                        <div className="batch-card-details">
                            <div className="batch-dates">
                                📅 {formatBatchDateRange(nextAvailableBatch)}
                            </div>
                            <div className="batch-enrollment-info">
                                👥 {nextAvailableBatch.enrollmentCount || 0} / {nextAvailableBatch.maxCapacity} enrolled
                            </div>
                            <div className="capacity-bar">
                                <div
                                    className="capacity-fill"
                                    style={{
                                        width: `${((nextAvailableBatch.enrollmentCount || 0) / nextAvailableBatch.maxCapacity) * 100}%`
                                    }}
                                />
                            </div>
                            <div className="auto-assign-note">
                                ℹ️ New enrollments will be automatically assigned to this batch
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Batches Overview */}
            <div className="all-batches">
                <h4>📋 All Batches</h4>
                <div className="batches-grid">
                    {course.batches.map((batch) => {
                        const stats = batchStats[batch.batchNumber] || batch;
                        const enrollmentCount = stats.enrollmentCount || 0;
                        const capacityPercentage = (enrollmentCount / batch.maxCapacity) * 100;

                        return (
                            <div key={batch.batchNumber} className="batch-card">
                                <div className="batch-card-header">
                                    <span className="batch-number" title={`Batch ${batch.batchNumber}`}>
                                        {getBatchShortName(batch)}
                                    </span>
                                    <span className={`batch-status batch-status-${batch.status}`}>
                                        {getBatchStatusText(batch)}
                                    </span>
                                </div>
                                <div className="batch-card-details">
                                    <div className="batch-dates">
                                        📅 {formatBatchDateRange(batch)}
                                    </div>
                                    <div className="batch-enrollment-info">
                                        👥 {enrollmentCount} / {batch.maxCapacity} enrolled
                                        <span className="enrollment-percentage">
                                            ({Math.round(capacityPercentage)}%)
                                        </span>
                                    </div>
                                    <div className="capacity-bar">
                                        <div
                                            className="capacity-fill"
                                            style={{ width: `${capacityPercentage}%` }}
                                        />
                                    </div>
                                    {batch.classLinks && (
                                        <div className="batch-links">
                                            🔗 Links:
                                            {batch.classLinks.zoom && <span className="link-indicator">Zoom</span>}
                                            {batch.classLinks.discord && <span className="link-indicator">Discord</span>}
                                            {batch.classLinks.materials && <span className="link-indicator">Materials</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .admin-batch-info {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border: 2px solid #007bff;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }

                .admin-batch-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #dee2e6;
                }

                .admin-batch-header h3 {
                    margin: 0;
                    color: #007bff;
                    font-size: 18px;
                }

                .batch-summary {
                    display: flex;
                    gap: 10px;
                }

                .batch-count {
                    background: #007bff;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 15px;
                    font-size: 11px;
                    font-weight: bold;
                    white-space: nowrap;
                }

                .admin-batch-error {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    border: 1px solid #f5c6cb;
                }

                .admin-batch-loading {
                    text-align: center;
                    padding: 20px;
                    color: #6c757d;
                }

                .next-enrollment-batch {
                    margin-bottom: 25px;
                }

                .next-enrollment-batch h4 {
                    color: #28a745;
                    margin-bottom: 12px;
                    font-size: 16px;
                }

                .batches-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 15px;
                }

                .batch-card {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    transition: all 0.3s ease;
                }

                .batch-card:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                .batch-card.highlight {
                    border: 2px solid #28a745;
                    background: linear-gradient(135deg, #ffffff 0%, #f8fff9 100%);
                }

                .batch-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .batch-number {
                    font-weight: bold;
                    font-size: 15px;
                    color: #495057;
                }

                .batch-status {
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .batch-status-upcoming {
                    background: #cce5ff;
                    color: #0066cc;
                }

                .batch-status-active {
                    background: #d4edda;
                    color: #155724;
                }

                .batch-status-completed {
                    background: #f8d7da;
                    color: #721c24;
                }

                .batch-card-details {
                    font-size: 13px;
                    color: #6c757d;
                }

                .batch-dates {
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .batch-enrollment-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .enrollment-percentage {
                    font-weight: bold;
                    color: #495057;
                }

                .capacity-bar {
                    height: 6px;
                    background: #e9ecef;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }

                .capacity-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
                    transition: width 0.3s ease;
                }

                .batch-links {
                    font-size: 11px;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    flex-wrap: wrap;
                }

                .link-indicator {
                    background: #e9ecef;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 10px;
                }

                .auto-assign-note {
                    background: #d1ecf1;
                    color: #0c5460;
                    padding: 6px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    margin-top: 8px;
                    border: 1px solid #bee5eb;
                }

                .all-batches h4 {
                    color: #495057;
                    margin-bottom: 15px;
                    font-size: 16px;
                }

                @media (max-width: 768px) {
                    .admin-batch-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .batch-summary {
                        flex-wrap: wrap;
                    }

                    .batches-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminBatchInfo;
