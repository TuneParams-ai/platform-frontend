// src/components/AdminEnrollments.jsx
// Component for managing enrollment records
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { findCourseById, getBatchByNumber, getBatchShortName } from '../data/coursesData';
import { isProgressTrackingEnabled } from '../utils/configUtils';
import ManualEnrollmentModal from './ManualEnrollmentModal';

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [showManualEnrollmentModal, setShowManualEnrollmentModal] = useState(false);

    // Check if progress tracking is enabled
    const progressTrackingEnabled = isProgressTrackingEnabled();

    const loadEnrollments = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load enrollments
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                orderBy('enrolledAt', 'desc')
            );
            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
            const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Load user data for all enrolled users
            const userIds = [...new Set(enrollmentsData.map(e => e.userId))];
            const usersData = {};

            if (userIds.length > 0) {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.docs.forEach(doc => {
                    const userData = doc.data();
                    if (userIds.includes(doc.id)) {
                        usersData[doc.id] = {
                            name: userData.name || userData.displayName || 'Unknown User',
                            email: userData.email || 'No email'
                        };
                    }
                });
            }

            setEnrollments(enrollmentsData);
            setUsers(usersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEnrollments();
    }, []);

    // Handle successful manual enrollment
    const handleManualEnrollmentSuccess = (result) => {
        // Reload enrollments to show the new enrollment
        loadEnrollments();
    };

    // Filter enrollments based on selected filters
    const filteredEnrollments = enrollments.filter(enrollment => {
        const batchMatch = selectedBatch === 'all' || enrollment.batchNumber?.toString() === selectedBatch;
        const courseMatch = selectedCourse === 'all' || enrollment.courseId === selectedCourse;
        return batchMatch && courseMatch;
    });

    // Get unique values for filters
    const uniqueCourses = [...new Set(enrollments.map(e => e.courseId))].filter(Boolean);
    const uniqueBatches = [...new Set(enrollments.map(e => e.batchNumber))].filter(Boolean).sort((a, b) => a - b);

    // Group enrollments by batch for summary
    const batchSummary = {};
    filteredEnrollments.forEach(enrollment => {
        const key = `${enrollment.courseId}_batch${enrollment.batchNumber || 'legacy'}`;
        if (!batchSummary[key]) {
            // Get custom batch name if available
            let batchDisplayName = enrollment.batchNumber || 'Legacy';
            if (enrollment.batchNumber) {
                const course = findCourseById(enrollment.courseId);
                if (course) {
                    const batch = getBatchByNumber(course, enrollment.batchNumber);
                    if (batch) {
                        batchDisplayName = getBatchShortName(batch);
                    } else {
                        batchDisplayName = `Batch ${enrollment.batchNumber}`;
                    }
                }
            }

            batchSummary[key] = {
                courseId: enrollment.courseId,
                courseTitle: enrollment.courseTitle,
                batchNumber: enrollment.batchNumber || 'Legacy',
                batchDisplayName: batchDisplayName,
                count: 0,
                totalRevenue: 0
            };
        }
        batchSummary[key].count++;
        batchSummary[key].totalRevenue += enrollment.amountPaid || 0;
    });

    return (
        <div>
            <div className="admin-section-header">
                <h2>Course Enrollments ({filteredEnrollments.length})</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowManualEnrollmentModal(true)}
                        className="admin-add-button"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        ➕ Manual Enroll
                    </button>
                    <button
                        onClick={loadEnrollments}
                        className="admin-refresh-button"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : '🔄 Refresh'}
                    </button>
                </div>
            </div>

            {error && <p className="admin-error">Error: {error}</p>}

            {/* Filters */}
            <div className="admin-filters">
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div>
                        <label htmlFor="course-filter">
                            Filter by Course:
                        </label>
                        <select
                            id="course-filter"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="all">All Courses</option>
                            {uniqueCourses.map(courseId => (
                                <option key={courseId} value={courseId}>{courseId}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="batch-filter">
                            Filter by Batch:
                        </label>
                        <select
                            id="batch-filter"
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                        >
                            <option value="all">All Batches</option>
                            {uniqueBatches.map(batchNumber => (
                                <option key={batchNumber} value={batchNumber.toString()}>
                                    Batch {batchNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Batch Summary */}
            {Object.keys(batchSummary).length > 0 && (
                <div className="batch-summary" style={{ marginBottom: '30px' }}>
                    <h3>Batch Summary</h3>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Batch</th>
                                    <th>Enrollments</th>
                                    <th>Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(batchSummary).map((summary, index) => (
                                    <tr key={index}>
                                        <td>{summary.courseTitle || summary.courseId}</td>
                                        <td>
                                            <span className={`batch-badge batch-${summary.batchNumber}`} title={`Batch ${summary.batchNumber}`}>
                                                {summary.batchDisplayName}
                                            </span>
                                        </td>
                                        <td>{summary.count}</td>
                                        <td>${summary.totalRevenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed Enrollments Table */}
            <h3>Detailed Enrollments</h3>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Enrolled Date</th>
                            <th>Course</th>
                            <th>Batch</th>
                            <th>User</th>
                            {progressTrackingEnabled && <th>Progress</th>}
                            <th>Status</th>
                            <th>Amount Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.map(enrollment => (
                            <tr key={enrollment.id}>
                                <td>
                                    {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                </td>
                                <td>
                                    <div>
                                        <strong>{enrollment.courseTitle}</strong>
                                        <br />
                                        <small style={{ color: '#666' }}>({enrollment.courseId})</small>
                                    </div>
                                </td>
                                <td>
                                    <span className={`batch-badge batch-${enrollment.batchNumber || 'legacy'}`}>
                                        {(() => {
                                            if (!enrollment.batchNumber) return 'Legacy';
                                            const course = findCourseById(enrollment.courseId);
                                            if (course) {
                                                const batch = getBatchByNumber(course, enrollment.batchNumber);
                                                if (batch) {
                                                    return getBatchShortName(batch);
                                                }
                                            }
                                            return `Batch ${enrollment.batchNumber}`;
                                        })()}
                                    </span>
                                </td>
                                <td className="user-info">
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                                            {users[enrollment.userId]?.name || 'Unknown User'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--secondary-text-color)' }}>
                                            {users[enrollment.userId]?.email || enrollment.userId}
                                        </div>
                                    </div>
                                </td>
                                {progressTrackingEnabled && (
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div
                                                style={{
                                                    width: '60px',
                                                    height: '8px',
                                                    backgroundColor: 'rgba(29, 126, 153, 0.2)',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${enrollment.progress || 0}%`,
                                                        height: '100%',
                                                        backgroundColor: enrollment.progress >= 100 ? '#4caf50' :
                                                            enrollment.progress >= 50 ? '#ff9800' : '#2196f3',
                                                        transition: 'width 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                            <span>{enrollment.progress || 0}%</span>
                                        </div>
                                    </td>
                                )}
                                <td>
                                    <span className={`status-${enrollment.status}`}>
                                        {enrollment.status}
                                    </span>
                                </td>
                                <td>
                                    ${enrollment.amountPaid}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredEnrollments.length === 0 && !loading && (
                <div className="admin-empty-state">
                    <p>No enrollment records found for the selected filters.</p>
                </div>
            )}

            {/* Additional CSS for batch badges */}
            <style jsx>{`
                .batch-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    text-align: center;
                    min-width: 60px;
                }

                .batch-1 {
                    background-color: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .batch-2 {
                    background-color: rgba(168, 85, 247, 0.2);
                    color: #c084fc;
                    border: 1px solid rgba(168, 85, 247, 0.3);
                }

                .batch-3 {
                    background-color: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }

                .batch-legacy {
                    background-color: rgba(107, 114, 128, 0.2);
                    color: var(--secondary-text-color);
                    border: 1px solid rgba(107, 114, 128, 0.3);
                }

                .admin-filters {
                    border: 1px solid rgba(29, 126, 153, 0.2);
                }

                .batch-summary {
                    border-top: 2px solid var(--primary-color);
                    padding-top: 20px;
                }

                .batch-summary h3 {
                    margin-bottom: 15px;
                    color: #333;
                }
            `}</style>

            {/* Manual Enrollment Modal */}
            <ManualEnrollmentModal
                isOpen={showManualEnrollmentModal}
                onClose={() => setShowManualEnrollmentModal(false)}
                onSuccess={handleManualEnrollmentSuccess}
            />
        </div>
    );
};

export default AdminEnrollments;
