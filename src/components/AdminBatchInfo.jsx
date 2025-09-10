// src/components/AdminBatchInfo.jsx
// Component for displaying batch information for admin users only
import React, { useState, useEffect } from 'react';
import { useUserRole } from '../hooks/useUserRole';
import { getCourseAllBatchStats, getNextAvailableBatchWithCount } from '../services/batchService';
import '../styles/admin-batch-info.css';
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminBatchInfo;
