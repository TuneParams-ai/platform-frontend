// src/components/AdminProgressManager.jsx
// Admin component for managing progress tracking system
import React, { useState, useEffect } from 'react';
import { isProgressTrackingEnabled } from '../utils/configUtils';
import { getAllUsers } from '../services/userService';
import { updateCourseProgress } from '../services/paymentService';
import { db } from '../config/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import '../styles/admin-progress-manager.css';

const AdminProgressManager = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [enrollments, setEnrollments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [newProgress, setNewProgress] = useState('');

    // Check if progress tracking is enabled
    const progressTrackingEnabled = isProgressTrackingEnabled();

    // Load initial data
    useEffect(() => {
        loadEnrollments();
        loadUsers();
    }, []);

    const loadEnrollments = async () => {
        setLoading(true);
        try {
            const enrollmentsRef = collection(db, 'enrollments');
            const q = query(enrollmentsRef, orderBy('enrolledAt', 'desc'));
            const snapshot = await getDocs(q);

            const enrollmentsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                enrolledAt: doc.data().enrolledAt?.toDate?.() || new Date(doc.data().enrolledAt)
            }));

            setEnrollments(enrollmentsList);
        } catch (err) {
            setError('Failed to load enrollments: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.users);
            }
        } catch (err) {}
    };

    const handleUpdateProgress = async (enrollment) => {
        if (!newProgress || newProgress < 0 || newProgress > 100) {
            setError('Please enter a valid progress value between 0 and 100');
            return;
        }

        setLoading(true);
        try {
            const result = await updateCourseProgress(
                enrollment.userId,
                enrollment.courseId,
                parseInt(newProgress),
                enrollment.batchNumber
            );

            if (result.success) {
                setSuccess(`Progress updated successfully for ${enrollment.courseTitle}`);
                setSelectedEnrollment(null);
                setNewProgress('');
                await loadEnrollments(); // Refresh the list
            } else {
                setError(result.error || 'Failed to update progress');
            }
        } catch (err) {
            setError('Failed to update progress: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getUserName = (userId) => {
        const userObj = users.find(u => u.id === userId);
        return userObj ? (userObj.displayName || userObj.email) : userId;
    };

    const getProgressStats = () => {
        const stats = {
            totalEnrollments: enrollments.length,
            completedCourses: enrollments.filter(e => e.progress >= 100).length,
            inProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
            notStarted: enrollments.filter(e => (e.progress || 0) === 0).length,
            averageProgress: 0
        };

        if (enrollments.length > 0) {
            const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
            stats.averageProgress = (totalProgress / enrollments.length).toFixed(1);
        }

        return stats;
    };

    const renderOverview = () => {
        const stats = getProgressStats();

        return (
            <div className="progress-overview">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Total Enrollments</h4>
                        <p className="stat-value">{stats.totalEnrollments}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Completed Courses</h4>
                        <p className="stat-value">{stats.completedCourses}</p>
                    </div>
                    <div className="stat-card">
                        <h4>In Progress</h4>
                        <p className="stat-value">{stats.inProgress}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Not Started</h4>
                        <p className="stat-value">{stats.notStarted}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Average Progress</h4>
                        <p className="stat-value">{stats.averageProgress}%</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderManageProgress = () => (
        <div className="progress-management">
            <h3>Manage Student Progress</h3>
            {enrollments.length === 0 ? (
                <p>No enrollments found.</p>
            ) : (
                <div className="enrollments-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Batch</th>
                                <th>Progress</th>
                                <th>Enrolled Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.map(enrollment => (
                                <tr key={enrollment.id}>
                                    <td>{getUserName(enrollment.userId)}</td>
                                    <td>{enrollment.courseTitle}</td>
                                    <td>
                                        <span className={`batch-badge batch-${enrollment.batchNumber}`}>
                                            Batch {enrollment.batchNumber}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="progress-display">
                                            <div className="progress-bar-small">
                                                <div
                                                    className="progress-fill-small"
                                                    style={{ width: `${enrollment.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-text-small">
                                                {enrollment.progress || 0}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>{formatDate(enrollment.enrolledAt)}</td>
                                    <td>
                                        <button
                                            onClick={() => setSelectedEnrollment(enrollment)}
                                            className="btn-update-progress"
                                            title="Update Progress"
                                        >
                                            📝
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Progress Update Modal */}
            {selectedEnrollment && (
                <div className="modal-overlay">
                    <div className="progress-update-modal">
                        <h4>Update Progress</h4>
                        <div className="modal-content">
                            <p><strong>Student:</strong> {getUserName(selectedEnrollment.userId)}</p>
                            <p><strong>Course:</strong> {selectedEnrollment.courseTitle}</p>
                            <p><strong>Current Progress:</strong> {selectedEnrollment.progress || 0}%</p>

                            <div className="form-group">
                                <label>New Progress (%)</label>
                                <input
                                    type="number"
                                    value={newProgress}
                                    onChange={(e) => setNewProgress(e.target.value)}
                                    placeholder="Enter progress (0-100)"
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    onClick={() => handleUpdateProgress(selectedEnrollment)}
                                    disabled={loading}
                                    className="btn-confirm"
                                >
                                    {loading ? 'Updating...' : 'Update Progress'}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedEnrollment(null);
                                        setNewProgress('');
                                    }}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="admin-progress-manager">
            <h2>Progress Tracking Management</h2>

            {/* Progress Tracking System Status Warning */}
            {!progressTrackingEnabled && (
                <div className="warning-banner">
                    <div className="warning-content">
                        <span className="warning-icon">⚠️</span>
                        <div className="warning-text">
                            <strong>Progress Tracking System Disabled</strong>
                            <p>The progress tracking system is currently disabled in the environment configuration.
                                Progress bars and tracking features will not be visible to users.
                                To enable progress tracking, set <code>REACT_APP_ENABLE_PROGRESS_TRACKING=true</code> in your .env file.</p>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="progress-tabs">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                >
                    📊 Overview
                </button>
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
                >
                    📝 Manage Progress
                </button>
            </div>

            <div className="progress-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'manage' && renderManageProgress()}
            </div>
        </div>
    );
};

export default AdminProgressManager;
