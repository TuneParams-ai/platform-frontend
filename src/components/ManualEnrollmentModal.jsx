// src/components/ManualEnrollmentModal.jsx
// Modal component for admin manual enrollment
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { findCourseById, getNextAvailableBatch, getCachedCourses, getBatchDisplayName } from '../data/coursesData';
import { getCourseBatches } from '../services/courseManagementService';
import { manualEnrollUser } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';
import '../styles/manual-enrollment-modal.css';

const ManualEnrollmentModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedBatchNumber, setSelectedBatchNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userEnrollments, setUserEnrollments] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [nextAvailableBatch, setNextAvailableBatch] = useState(null);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [courses, setCourses] = useState([]);

    // Load users and courses on component mount
    useEffect(() => {
        if (isOpen) {
            loadUsers();
            loadCourses();
        }
    }, [isOpen]);

    const loadCourses = async () => {
        try {
            const coursesData = await getCachedCourses();
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
            setCourses([]);
        }
    };

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
            setFilteredUsers(usersData);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    // Filter users based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
            return;
        }

        const filtered = users.filter(user => {
            const displayName = user.displayName || '';
            const email = user.email || '';
            const searchLower = searchTerm.toLowerCase();

            return (
                displayName.toLowerCase().includes(searchLower) ||
                email.toLowerCase().includes(searchLower)
            );
        });

        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    // Load batch information when course selection changes
    useEffect(() => {
        const loadBatchInfo = async () => {
            if (!selectedCourseId) {
                setAvailableBatches([]);
                setNextAvailableBatch(null);
                setSelectedBatchNumber('');
                return;
            }

            try {
                console.log('Loading batch info for course:', selectedCourseId);
                const course = await findCourseById(selectedCourseId);
                console.log('Found course:', course);

                if (course) {
                    // Load batches from Firestore subcollection
                    const batches = await getCourseBatches(selectedCourseId);
                    console.log('Course batches from Firestore:', batches);
                    setAvailableBatches(batches);

                    const nextBatch = await getNextAvailableBatch(selectedCourseId);
                    console.log('Next available batch:', nextBatch);
                    setNextAvailableBatch(nextBatch);

                    // Auto-select the next available batch as default
                    if (nextBatch) {
                        setSelectedBatchNumber(nextBatch.batchNumber.toString());
                    } else if (batches.length > 0) {
                        // If no "next" batch, select the latest batch
                        const latestBatch = batches[batches.length - 1];
                        setSelectedBatchNumber(latestBatch.batchNumber.toString());
                    } else {
                        setSelectedBatchNumber('');
                    }
                }
            } catch (error) {
                console.error('Error loading batch info:', error);
                setAvailableBatches([]);
                setNextAvailableBatch(null);
                setSelectedBatchNumber('');
            }
        };

        loadBatchInfo();
    }, [selectedCourseId]);

    // Load user enrollments when a user is selected
    const loadUserEnrollments = async (userId) => {
        setLoadingEnrollments(true);
        try {
            // Get all enrollments and filter for this user
            const allEnrollmentsQuery = query(collection(db, 'enrollments'));
            const allEnrollmentsSnapshot = await getDocs(allEnrollmentsQuery);
            const allEnrollments = allEnrollmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter enrollments for this user - check multiple possible field names
            const userEnrollments = allEnrollments.filter(enrollment => {
                return enrollment.userId === userId ||
                    enrollment.uid === userId ||
                    enrollment.userID === userId ||
                    enrollment.user_id === userId;
            });

            setUserEnrollments(userEnrollments);
        } catch (err) {
            console.error('Failed to load user enrollments:', err);
            setUserEnrollments([]);
        } finally {
            setLoadingEnrollments(false);
        }
    };    // Handle user selection
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSelectedUserId(user.id);
        setSearchTerm(user.displayName || user.email);
        setShowUserDropdown(false);
        loadUserEnrollments(user.id);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setShowUserDropdown(true);
        if (!e.target.value.trim()) {
            setSelectedUser(null);
            setSelectedUserId('');
            setUserEnrollments([]);
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
            // Use the selected batch number
            const batchNumberToUse = selectedBatchNumber ? parseInt(selectedBatchNumber) : null;

            const result = await manualEnrollUser(
                selectedUserId,
                selectedCourseId,
                user.uid,
                batchNumberToUse,
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
        setSearchTerm('');
        setSelectedUser(null);
        setSelectedUserId('');
        setSelectedCourseId('');
        setSelectedBatchNumber('');
        setNotes('');
        setError(null);
        setUserEnrollments([]);
        setShowUserDropdown(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const selectedCourse = courses.find(course => course.id === selectedCourseId);

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

                        {/* User Search */}
                        <div className="form-group">
                            <label htmlFor="user-search">Search User *</label>
                            {loadingUsers ? (
                                <div className="loading-indicator">Loading users...</div>
                            ) : (
                                <div className="user-search-container">
                                    <input
                                        type="text"
                                        id="user-search"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={() => setShowUserDropdown(true)}
                                        placeholder="Search by name or email..."
                                        required
                                    />

                                    {showUserDropdown && filteredUsers.length > 0 && (
                                        <div className="user-dropdown">
                                            {filteredUsers.slice(0, 10).map(user => (
                                                <div
                                                    key={user.id}
                                                    className="user-option"
                                                    onClick={() => handleUserSelect(user)}
                                                >
                                                    <div className="user-name">
                                                        {user.displayName || 'No Name'}
                                                    </div>
                                                    <div className="user-email">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selected User Info */}
                            {selectedUser && (
                                <div className="selected-user-info">
                                    <p><strong>Selected User:</strong></p>
                                    <p><strong>Name:</strong> {selectedUser.displayName || 'No Name'}</p>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                </div>
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
                                {courses.map(course => (
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
                                {availableBatches.length > 0 ? (
                                    <>
                                        <select
                                            id="batch-select"
                                            value={selectedBatchNumber}
                                            onChange={(e) => setSelectedBatchNumber(e.target.value)}
                                        >
                                            {availableBatches.map(batch => (
                                                <option key={batch.batchNumber} value={batch.batchNumber}>
                                                    {getBatchDisplayName(batch)} - {batch.status}
                                                    {nextAvailableBatch && batch.batchNumber === nextAvailableBatch.batchNumber && ' (Current)'}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="field-help">
                                            {nextAvailableBatch && selectedBatchNumber === nextAvailableBatch.batchNumber.toString()
                                                ? 'This is the current active/upcoming batch'
                                                : 'Select which batch to enroll the user in'}
                                        </small>
                                    </>
                                ) : (
                                    <div className="loading-message">
                                        <p>Loading batches for {selectedCourse.title}...</p>
                                        <small>If this persists, the course might not have any batches configured.</small>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User's Current Enrollments */}
                        {selectedUser && (
                            <div className="form-group">
                                <h4>Current Enrollments</h4>
                                {loadingEnrollments ? (
                                    <div className="loading-indicator">Loading enrollments...</div>
                                ) : userEnrollments.length > 0 ? (
                                    <div className="user-enrollments">
                                        {userEnrollments.map(enrollment => {
                                            const course = courses.find(c => c.id === enrollment.courseId);
                                            return (
                                                <div key={enrollment.id} className="enrollment-item">
                                                    <div className="enrollment-course">
                                                        <strong>{enrollment.courseTitle || course?.title || enrollment.courseId}</strong>
                                                    </div>
                                                    <div className="enrollment-details">
                                                        <span className="enrollment-status">{enrollment.status || 'ENROLLED'}</span>
                                                        {enrollment.batchNumber && (
                                                            <span className="enrollment-batch">
                                                                Batch {enrollment.batchNumber}
                                                            </span>
                                                        )}
                                                        <span className="enrollment-date">
                                                            {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="no-enrollments">No previous enrollments found.</p>
                                )}
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

                                {/* Batch Selection Summary */}
                                <div className="batch-selection-summary">
                                    {selectedBatchNumber ? (
                                        <p><strong>Selected Batch:</strong> {getBatchDisplayName(availableBatches.find(b => b.batchNumber.toString() === selectedBatchNumber))}</p>
                                    ) : (
                                        <p><strong>Batch:</strong> <em>No batch selected</em></p>
                                    )}
                                </div>
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
