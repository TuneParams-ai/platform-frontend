import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import '../styles/course-dashboard.css';

const CourseDashboard = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const foundCourse = findCourseById(courseId);
        if (foundCourse) {
            setCourse(foundCourse);
            // Set the current active batch as default
            const currentBatch = getCurrentBatch(foundCourse);
            const activeBatches = getActiveBatches(foundCourse);
            setSelectedBatch(currentBatch || (activeBatches.length > 0 ? activeBatches[0] : foundCourse.batches?.[0]));
        }
        setLoading(false);
    }, [courseId]);

    // Function to determine class status based on current date and time
    const getClassStatus = (scheduleItem) => {
        // If no proper date/time data, return scheduled
        if (!scheduleItem.date || !scheduleItem.time) {
            return 'scheduled';
        }

        const now = new Date();

        // Parse the class date and time
        const classDate = new Date(scheduleItem.date);
        const [hours, minutes] = scheduleItem.time.split(':');
        classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

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

        const classDate = new Date(scheduleItem.date);
        const [hours, minutes] = scheduleItem.time.split(':');
        classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

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

                {/* Batch Selector */}
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
                                {getStatusBadge(batch)}
                            </button>
                        ))}
                    </div>
                </div>

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
                                            Join Live Class
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
                                    {getAvailableAccessLinks(selectedBatch).materials ? (
                                        <a
                                            href={getAvailableAccessLinks(selectedBatch).materials}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="access-link"
                                        >
                                            Access Materials
                                        </a>
                                    ) : (
                                        <span className="link-unavailable">Materials will be available soon</span>
                                    )}
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
                                                            Join Live Class
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

                        {/* Batch Information */}
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
                                    <p>{selectedBatch.enrollmentCount || 0} / {selectedBatch.maxCapacity} students</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDashboard;
