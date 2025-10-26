import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    findCourseById,
    getCurrentBatch,
    getActiveBatches,
    getBatchDisplayName,
    formatBatchDateRange,
    hasSchedule,
    hasAccessLinks,
    getAvailableAccessLinks
} from '../data/coursesData';
import { useAuth } from '../hooks/useAuth';
import { useCourseAccess } from '../hooks/useCourseAccess';
import { useUserRole } from '../hooks/useUserRole';
import VideoLibrary from '../components/VideoLibrary';
import '../styles/course-dashboard.css';

const CourseDashboard = () => {
    const { courseId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const { hasAccess, enrollment, loading: accessLoading } = useCourseAccess(courseId);
    const { isAdminUser, loading: roleLoading } = useUserRole();
    const [course, setCourse] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [batchEnrollmentCounts, setBatchEnrollmentCounts] = useState({});

    useEffect(() => {
        const foundCourse = findCourseById(courseId);
        if (foundCourse) {
            setCourse(foundCourse);

            // For regular users: use their enrolled batch or default to first available
            // For admins: show current active batch or first batch
            if (!roleLoading && !accessLoading && !authLoading) {
                if (isAdminUser) {
                    // Admin can see all batches - set default to current batch
                    const currentBatch = getCurrentBatch(foundCourse);
                    const activeBatches = getActiveBatches(foundCourse);
                    setSelectedBatch(currentBatch || (activeBatches.length > 0 ? activeBatches[0] : foundCourse.batches?.[0]));
                } else if (enrollment) {
                    // Regular user: find their enrolled batch
                    const userBatch = foundCourse.batches?.find(batch => batch.batchNumber === enrollment.batchNumber);
                    setSelectedBatch(userBatch);
                } else {
                    // For development: if no enrollment found, default to current active batch
                    const currentBatch = getCurrentBatch(foundCourse);
                    const activeBatches = getActiveBatches(foundCourse);
                    setSelectedBatch(currentBatch || (activeBatches.length > 0 ? activeBatches[0] : foundCourse.batches?.[0]));
                }
            }
        }
        setLoading(false);
    }, [courseId, enrollment, isAdminUser, roleLoading, accessLoading, authLoading]);

    // Load enrollment counts for all batches
    useEffect(() => {
        const loadEnrollmentCounts = async () => {
            if (!course) return;

            try {
                // Get all enrollments for this course
                const enrollmentsQuery = query(
                    collection(db, 'enrollments'),
                    where('courseId', '==', courseId)
                );
                const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
                const enrollments = enrollmentsSnapshot.docs.map(doc => doc.data());

                // Count enrollments by batch
                const counts = {};
                course.batches?.forEach(batch => {
                    // Handle different ways batch numbers might be stored
                    const batchEnrollments = enrollments.filter(e => {
                        return e.batchNumber === batch.batchNumber ||
                            parseInt(e.batchNumber) === parseInt(batch.batchNumber) ||
                            String(e.batchNumber) === String(batch.batchNumber);
                    });
                    counts[batch.batchNumber] = batchEnrollments.length;
                });

                // Also count legacy enrollments (those without batch numbers)
                const legacyEnrollments = enrollments.filter(e => !e.batchNumber);
                if (legacyEnrollments.length > 0) {
                    counts['legacy'] = legacyEnrollments.length;
                }

                setBatchEnrollmentCounts(counts);
            } catch (error) {
                console.error('Failed to load enrollment counts:', error);
            }
        };

        loadEnrollmentCounts();
    }, [course, courseId]);

    // Show loading while checking authentication, access, and role
    if (loading || accessLoading || roleLoading || authLoading) {
        return (
            <div className="course-dashboard-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h2>Loading dashboard...</h2>
                    <p>Please wait while we verify your access...</p>
                </div>
            </div>
        );
    }

    // Redirect if user is not logged in (only after auth loading is complete)
    if (!authLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    // Show loading if access is still being verified
    if (!authLoading && user && accessLoading) {
        return (
            <div className="course-dashboard-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <h2>Verifying enrollment...</h2>
                    <p>Checking your course access...</p>
                </div>
            </div>
        );
    }

    // Simplified access control for development
    // Allow access for: 1) Admins (all courses), 2) Users with proper enrollment
    const shouldAllowAccess = isAdminUser || (user && hasAccess);

    if (!authLoading && !roleLoading && !accessLoading && user && !shouldAllowAccess) {
        return (
            <div className="course-dashboard-container">
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>You need to be enrolled in this course to access the dashboard.</p>
                    <Link to={`/course/${courseId}`} className="back-to-course-btn">
                        View Course Details
                    </Link>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-dashboard-container">
                <div className="error-state">
                    <h2>Course not found</h2>
                    <Link to="/courses" className="back-to-courses-btn">
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    // Function to determine class status based on current date and time
    const getClassStatus = (scheduleItem) => {
        // If no proper date/time data, return scheduled
        if (!scheduleItem.date || !scheduleItem.time) {
            return 'scheduled';
        }

        const now = new Date();

        // Parse date components to avoid timezone issues
        const [year, month, day] = scheduleItem.date.split('-').map(Number);
        const [hours, minutes] = scheduleItem.time.split(':').map(Number);

        // Create date in local timezone to avoid UTC conversion issues
        const classDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

        // Calculate the class end time using duration
        const classDuration = scheduleItem.duration || 90; // default 90 minutes
        const classEndTime = new Date(classDate.getTime() + (classDuration * 60 * 1000));

        // Calculate time differences in minutes
        const timeDiffStart = (now - classDate) / (1000 * 60); // minutes since class start
        const timeDiffEnd = (now - classEndTime) / (1000 * 60); // minutes since class end

        // Determine status:
        // Live: 30 minutes before start until class ends
        // Completed: after class ends
        // Scheduled: more than 30 minutes before start

        if (timeDiffStart >= -30 && timeDiffEnd <= 0) {
            return 'live';
        } else if (timeDiffEnd > 0) {
            return 'completed';
        } else {
            return 'scheduled';
        }
    };

    const formatScheduleDateTime = (scheduleItem) => {
        if (!scheduleItem.date || !scheduleItem.time) return 'TBD';

        // Parse date components to avoid timezone issues
        const [year, month, day] = scheduleItem.date.split('-').map(Number);
        const [hours, minutes] = scheduleItem.time.split(':').map(Number);

        // Create date in local timezone to avoid UTC conversion issues
        const classDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

        const dateStr = classDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const timeStr = classDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const timezone = scheduleItem.timezone ? ` (${scheduleItem.timezone})` : '';
        const duration = scheduleItem.duration ? ` • ${scheduleItem.duration} mins` : '';
        return `${dateStr} at ${timeStr}${timezone}${duration}`;
    };

    const getStatusBadge = (batch) => {
        const statusColors = {
            'upcoming': 'bg-blue-100 text-blue-800',
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-gray-100 text-gray-800'
        };

        const statusText = {
            'upcoming': 'Starting Soon',
            'active': 'In Progress',
            'completed': 'Completed'
        };

        return (
            <span className={`status-badge ${statusColors[batch.status]}`}>
                {statusText[batch.status]}
            </span>
        );
    };

    const getClassStatusBadge = (status) => {
        switch (status) {
            case 'live':
                return (
                    <span className="live-badge">
                        <span className="live-indicator"></span>
                        LIVE
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="scheduled-badge">
                        SCHEDULED
                    </span>
                );
            case 'completed':
                return (
                    <span className="completed-badge">
                        COMPLETED
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="course-dashboard">
                <div className="loading-container">
                    <div className="loading-spinner">Loading course dashboard...</div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-dashboard">
                <div className="error-container">
                    <h1>Course Not Found</h1>
                    <p>The course you're looking for doesn't exist.</p>
                    <Link to="/courses" className="back-link">Back to Courses</Link>
                </div>
            </div>
        );
    }

    if (!course.batches || course.batches.length === 0) {
        return (
            <div className="course-dashboard">
                <div className="dashboard-container">
                    <div className="course-header">
                        <h1>{course.title}</h1>
                        <p>No batches available for this course yet.</p>
                        <Link to="/courses" className="back-link">Back to Courses</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="course-dashboard">
            <div className="dashboard-container">
                {/* Course Header */}
                <div className="course-header">
                    <div className="course-info">
                        <h1>{course.title} Dashboard</h1>
                        <p className="course-description">{course.description}</p>
                    </div>
                    <div className="navigation-links">
                        <Link to="/courses" className="back-link">← Back to Courses</Link>
                        <Link to={`/courses/${courseId}`} className="course-detail-link">Course Details</Link>
                    </div>
                </div>

                {/* Batch Selector - Admin Only */}
                {isAdminUser && (
                    <div className="batch-selector">
                        <h2>Select Batch</h2>
                        <div className="batch-tabs">
                            {course.batches.map((batch) => (
                                <button
                                    key={batch.batchNumber}
                                    className={`batch-tab ${selectedBatch?.batchNumber === batch.batchNumber ? 'active' : ''}`}
                                    onClick={() => setSelectedBatch(batch)}
                                >
                                    <span className="batch-name">{getBatchDisplayName(batch)}</span>
                                    <span className="batch-dates">{formatBatchDateRange(batch)}</span>
                                    <span className="batch-capacity" style={{
                                        fontSize: '12px',
                                        color: 'var(--secondary-text-color)',
                                        background: 'rgba(29, 126, 153, 0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        margin: '2px 0'
                                    }}>
                                        {batchEnrollmentCounts[batch.batchNumber] || 0} / {batch.maxCapacity} enrolled
                                    </span>
                                    {getStatusBadge(batch)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedBatch && (
                    <div className="dashboard-content">
                        {/* Quick Access Links */}
                        <div className="quick-access-section">
                            <h2>Quick Access</h2>
                            <div className="quick-access-grid">
                                <div className="access-card zoom-card">
                                    <div className="card-icon">📹</div>
                                    <h3>Zoom Classroom</h3>
                                    {getAvailableAccessLinks(selectedBatch).zoom ? (
                                        <a
                                            href={getAvailableAccessLinks(selectedBatch).zoom}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="access-link"
                                        >
                                            Join Class
                                        </a>
                                    ) : (
                                        <span className="link-unavailable">Link will be shared soon</span>
                                    )}
                                </div>

                                <div className="access-card discord-card">
                                    <div className="card-icon">💬</div>
                                    <h3>Discord Community</h3>
                                    {getAvailableAccessLinks(selectedBatch).discord ? (
                                        <a
                                            href={getAvailableAccessLinks(selectedBatch).discord}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="access-link"
                                        >
                                            Join Discussion
                                        </a>
                                    ) : (
                                        <span className="link-unavailable">Link will be shared soon</span>
                                    )}
                                </div>

                                <div className="access-card materials-card">
                                    <div className="card-icon">📚</div>
                                    <h3>Course Materials</h3>
                                    <span className="link-unavailable">Materials will be available soon</span>
                                </div>
                            </div>
                        </div>

                        {/* Class Schedule */}
                        <div className="schedule-section">
                            <h2>Class Schedule</h2>
                            {hasSchedule(selectedBatch) ? (
                                <div className="schedule-list">
                                    {selectedBatch.schedule.map((scheduleItem, index) => {
                                        const classStatus = getClassStatus(scheduleItem);
                                        return (
                                            <div key={index} className={`schedule-card ${classStatus === 'live' ? 'live-class' : classStatus === 'completed' ? 'completed-class' : 'scheduled-class'}`}>
                                                <div className="schedule-header">
                                                    <div className="date-time-info">
                                                        <h3>{scheduleItem.topic || 'Topic TBD'}</h3>
                                                        <p className="date-time">
                                                            {formatScheduleDateTime(scheduleItem)}
                                                        </p>
                                                    </div>
                                                    {getClassStatusBadge(classStatus)}
                                                </div>
                                                <div className="schedule-content">
                                                    {classStatus === 'live' && hasAccessLinks(selectedBatch) && (
                                                        <a
                                                            href={getAvailableAccessLinks(selectedBatch).zoom || selectedBatch.classLinks.zoom}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="join-now-btn"
                                                        >
                                                            Join Class
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="no-schedule">
                                    <div className="no-schedule-icon">📅</div>
                                    {selectedBatch.status === 'completed' ? (
                                        <>
                                            <h3>No Schedule Available</h3>
                                            <p>This batch has been completed. Schedule is no longer available.</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3>Schedule Coming Soon</h3>
                                            <p>The class schedule for this batch will be announced soon. Stay tuned!</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Video Library Section */}
                        <VideoLibrary
                            videos={selectedBatch.videos || []}
                            batchNumber={selectedBatch.batchNumber}
                        />

                        {/* Batch Information - Admin Only */}
                        {isAdminUser && (
                            <div className="batch-info-section">
                                <h2>Batch Information</h2>
                                <div className="batch-info-grid">
                                    <div className="info-card">
                                        <h4>Batch Name</h4>
                                        <p>{getBatchDisplayName(selectedBatch)}</p>
                                    </div>
                                    <div className="info-card">
                                        <h4>Duration</h4>
                                        <p>{formatBatchDateRange(selectedBatch)}</p>
                                    </div>
                                    <div className="info-card">
                                        <h4>Status</h4>
                                        <p>{getStatusBadge(selectedBatch)}</p>
                                    </div>
                                    <div className="info-card">
                                        <h4>Capacity</h4>
                                        <p>{batchEnrollmentCounts[selectedBatch?.batchNumber] || 0} / {selectedBatch.maxCapacity} students</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDashboard;
