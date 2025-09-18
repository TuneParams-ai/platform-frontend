// src/components/AdminEnrollments.jsx
// Component for managing enrollment records
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
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
    const [deletingEnrollment, setDeletingEnrollment] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    // Handle delete enrollment
    const handleDeleteEnrollment = (enrollment) => {
        setDeletingEnrollment(enrollment);
        setShowDeleteConfirm(true);
    };

    // Confirm delete enrollment
    const confirmDeleteEnrollment = async () => {
        if (!deletingEnrollment) return;

        try {
            setLoading(true);
            await deleteDoc(doc(db, 'enrollments', deletingEnrollment.id));

            // Remove from local state
            setEnrollments(prev => prev.filter(e => e.id !== deletingEnrollment.id));

            setShowDeleteConfirm(false);
            setDeletingEnrollment(null);
        } catch (err) {
            setError('Failed to delete enrollment: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeletingEnrollment(null);
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

            {/* Quick Statistics */}
            {!loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    margin: '20px 0',
                    padding: '15px',
                    background: 'rgba(29, 126, 153, 0.05)',
                    border: '1px solid rgba(29, 126, 153, 0.2)',
                    borderRadius: '8px'
                }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                            {filteredEnrollments.length}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text-color)' }}>
                            Total Enrollments
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                            ${filteredEnrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text-color)' }}>
                            Total Revenue
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                            {new Set(filteredEnrollments.map(e => e.userId)).size}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text-color)' }}>
                            Unique Users
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-color)' }}>
                            {filteredEnrollments.filter(e => e.paymentMethod === 'paypal').length}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary-text-color)' }}>
                            PayPal Payments
                        </div>
                    </div>
                </div>
            )}

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
                            <th>Payment Method</th>
                            <th>Notes</th>
                            <th>Enrollment ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.map(enrollment => (
                            <tr key={enrollment.id}>
                                <td>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                                            {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--secondary-text-color)' }}>
                                            {enrollment.enrolledAt?.toDate?.()?.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) || ''}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-color)', marginBottom: '2px' }}>
                                            {enrollment.courseTitle}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--secondary-text-color)' }}>
                                            ID: {enrollment.courseId}
                                        </div>
                                        {enrollment.couponCode && (
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#10b981',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                padding: '1px 4px',
                                                borderRadius: '3px',
                                                marginTop: '2px',
                                                display: 'inline-block'
                                            }}>
                                                Coupon: {enrollment.couponCode}
                                            </div>
                                        )}
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
                                    ${enrollment.amountPaid || 0}
                                </td>
                                <td>
                                    <span style={{
                                        fontSize: '12px',
                                        color: 'var(--secondary-text-color)',
                                        textTransform: 'capitalize'
                                    }}>
                                        {enrollment.paymentMethod || 'Manual'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--secondary-text-color)',
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }} title={enrollment.notes}>
                                        {enrollment.notes || enrollment.adminNotes || '-'}
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        fontSize: '11px',
                                        fontFamily: 'monospace',
                                        color: 'var(--secondary-text-color)',
                                        background: 'rgba(29, 126, 153, 0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        {enrollment.id}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteEnrollment(enrollment)}
                                        style={{
                                            background: 'rgba(220, 38, 38, 0.2)',
                                            border: '1px solid rgba(220, 38, 38, 0.3)',
                                            color: '#dc2626',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(220, 38, 38, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(220, 38, 38, 0.2)';
                                        }}
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
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

                /* Responsive table styles */
                @media (max-width: 1200px) {
                    .admin-table-container {
                        overflow-x: auto;
                    }
                    
                    .admin-table th:nth-child(8),
                    .admin-table td:nth-child(8) {
                        display: none; /* Hide Payment Method on smaller screens */
                    }
                }

                @media (max-width: 968px) {
                    .admin-table th:nth-child(9),
                    .admin-table td:nth-child(9) {
                        display: none; /* Hide Notes on smaller screens */
                    }
                    
                    .admin-table th:nth-child(10),
                    .admin-table td:nth-child(10) {
                        display: none; /* Hide Enrollment ID on smaller screens */
                    }
                }

                @media (max-width: 768px) {
                    .admin-table {
                        font-size: 12px;
                    }
                    
                    .admin-table th,
                    .admin-table td {
                        padding: 6px;
                    }
                }
            `}</style>

            {/* Manual Enrollment Modal */}
            <ManualEnrollmentModal
                isOpen={showManualEnrollmentModal}
                onClose={() => setShowManualEnrollmentModal(false)}
                onSuccess={handleManualEnrollmentSuccess}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && deletingEnrollment && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--background-color)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(220, 38, 38, 0.2)'
                    }}>
                        <div style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
                            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(185, 28, 28, 0.8))',
                            color: 'white',
                            borderRadius: '12px 12px 0 0'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                                Confirm Delete Enrollment
                            </h2>
                        </div>

                        <div style={{ padding: '25px' }}>
                            <p style={{ margin: '0 0 20px 0', color: 'var(--text-color)' }}>
                                Are you sure you want to delete this enrollment?
                            </p>

                            <div style={{
                                background: 'rgba(220, 38, 38, 0.1)',
                                border: '1px solid rgba(220, 38, 38, 0.2)',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--text-color)' }}>
                                    <strong>User:</strong> {users[deletingEnrollment.userId]?.name || 'Unknown User'}
                                </p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--secondary-text-color)' }}>
                                    <strong>Email:</strong> {users[deletingEnrollment.userId]?.email || deletingEnrollment.userId}
                                </p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--secondary-text-color)' }}>
                                    <strong>Course:</strong> {deletingEnrollment.courseTitle || findCourseById(deletingEnrollment.courseId)?.title}
                                </p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--secondary-text-color)' }}>
                                    <strong>Batch:</strong> {(() => {
                                        if (!deletingEnrollment.batchNumber) return 'Legacy';
                                        const course = findCourseById(deletingEnrollment.courseId);
                                        if (course) {
                                            const batch = getBatchByNumber(course, deletingEnrollment.batchNumber);
                                            if (batch) {
                                                return getBatchShortName(batch);
                                            }
                                        }
                                        return `Batch ${deletingEnrollment.batchNumber}`;
                                    })()}
                                </p>
                                <p style={{ margin: '0', fontSize: '14px', color: 'var(--secondary-text-color)' }}>
                                    <strong>Amount Paid:</strong> ${deletingEnrollment.amountPaid || 0}
                                </p>
                            </div>

                            <p style={{
                                margin: '0 0 20px 0',
                                color: '#dc2626',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                ⚠️ This action cannot be undone.
                            </p>

                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={cancelDelete}
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid rgba(29, 126, 153, 0.3)',
                                        background: 'transparent',
                                        color: 'var(--text-color)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteEnrollment}
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #dc2626',
                                        background: '#dc2626',
                                        color: 'white',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Deleting...' : 'Delete Enrollment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEnrollments;
