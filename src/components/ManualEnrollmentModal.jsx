// src/components/ManualEnrollmentModal.jsx
// Modal component for admin manual enrollment
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { coursesData, getNextAvailableBatch, getBatchDisplayName } from '../data/coursesData';
import { manualEnrollUser } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';
import '../styles/manual-enrollment-modal.css';

const ManualEnrollmentModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedBatchNumber, setSelectedBatchNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Load users on component mount
    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            // Get all users from the users collection
            const usersQuery = query(collection(db, 'users'));
            const usersSnapshot = await getDocs(usersQuery);
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (err) {setError('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUserId || !selectedCourseId) {
            setError('Please select both user and course');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await manualEnrollUser(
                selectedUserId,
                selectedCourseId,
                user.uid,
                selectedBatchNumber ? parseInt(selectedBatchNumber) : null,
                notes
            );

            if (result.success) {
                onSuccess?.(result);
                resetForm();
                onClose();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedUserId('');
        setSelectedCourseId('');
        setSelectedBatchNumber('');
        setNotes('');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const selectedCourse = coursesData.find(course => course.id === selectedCourseId);
    const availableBatches = selectedCourse?.batches || [];
    const nextAvailableBatch = selectedCourse ? getNextAvailableBatch(selectedCourse) : null;

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content manual-enrollment-modal">
                <div className="modal-header">
                    <h2>Manual User Enrollment</h2>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {/* User Selection */}
                        <div className="form-group">
                            <label htmlFor="user-select">Select User *</label>
                            {loadingUsers ? (
                                <div className="loading-indicator">Loading users...</div>
                            ) : (
                                <select
                                    id="user-select"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select User --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.displayName || user.email} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Course Selection */}
                        <div className="form-group">
                            <label htmlFor="course-select">Select Course *</label>
                            <select
                                id="course-select"
                                value={selectedCourseId}
                                onChange={(e) => {
                                    setSelectedCourseId(e.target.value);
                                    setSelectedBatchNumber(''); // Reset batch selection
                                }}
                                required
                            >
                                <option value="">-- Select Course --</option>
                                {coursesData.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Batch Selection */}
                        {selectedCourse && (
                            <div className="form-group">
                                <label htmlFor="batch-select">Select Batch</label>
                                <select
                                    id="batch-select"
                                    value={selectedBatchNumber}
                                    onChange={(e) => setSelectedBatchNumber(e.target.value)}
                                >
                                    <option value="">
                                        Auto-assign to next available batch
                                        {nextAvailableBatch && ` (${getBatchDisplayName(nextAvailableBatch)})`}
                                    </option>
                                    {availableBatches.map(batch => (
                                        <option key={batch.batchNumber} value={batch.batchNumber}>
                                            {getBatchDisplayName(batch)} - {batch.status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="form-group">
                            <label htmlFor="notes">Notes (Optional)</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this manual enrollment..."
                                rows={3}
                            />
                        </div>

                        {/* Selected Course Info */}
                        {selectedCourse && (
                            <div className="course-info">
                                <h4>Course Information</h4>
                                <p><strong>Title:</strong> {selectedCourse.title}</p>
                                <p><strong>Duration:</strong> {selectedCourse.duration}</p>
                                <p><strong>Level:</strong> {selectedCourse.level}</p>
                                {nextAvailableBatch && (
                                    <p><strong>Next Available Batch:</strong> {getBatchDisplayName(nextAvailableBatch)}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !selectedUserId || !selectedCourseId}
                        >
                            {loading ? 'Enrolling...' : 'Enroll User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualEnrollmentModal;
