import React, { useState } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import '../styles/course-management.css';

const CourseManagement = () => {
    const { isAdmin, loading: roleLoading } = useUserRole();
    const { courses, loading: coursesLoading, error, refetch } = useCourses();
    const [activeTab, setActiveTab] = useState('courses');
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Redirect if not admin
    if (!roleLoading && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    if (roleLoading || coursesLoading) {
        return (
            <div className="course-management-loading">
                <div className="spinner"></div>
                <p>Loading course management...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="course-management-error">
                <h2>Error Loading Courses</h2>
                <p>{error}</p>
                <button onClick={refetch} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="course-management">
            <div className="course-management-header">
                <h1>📚 Course Management</h1>
                <p>Manage all course content, batches, videos, and schedules</p>
            </div>

            <div className="course-management-content">
                {/* Sidebar - Course List */}
                <div className="course-sidebar">
                    <div className="sidebar-header">
                        <h3>Courses ({courses.length})</h3>
                        <button className="btn-primary">+ New Course</button>
                    </div>

                    <div className="course-list">
                        {courses.map(course => (
                            <div
                                key={course.id}
                                className={`course-item ${selectedCourse?.id === course.id ? 'active' : ''}`}
                                onClick={() => setSelectedCourse(course)}
                            >
                                <div className="course-icon">{course.icon}</div>
                                <div className="course-info">
                                    <h4>{course.title}</h4>
                                    <span className="course-id">{course.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="course-main-content">
                    {!selectedCourse ? (
                        <div className="no-selection">
                            <div className="empty-state">
                                <h2>No Course Selected</h2>
                                <p>Select a course from the sidebar to manage its content</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Course Header */}
                            <div className="selected-course-header">
                                <div className="course-title-section">
                                    <h2>{selectedCourse.icon} {selectedCourse.title}</h2>
                                    <span className="course-status">
                                        {selectedCourse.comingSoon ? '🔜 Coming Soon' : '✅ Active'}
                                    </span>
                                </div>
                                <div className="course-actions">
                                    <button className="btn-secondary">Edit Course Info</button>
                                    <button className="btn-danger">Delete Course</button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="course-tabs">
                                <button
                                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    📋 Overview
                                </button>
                                <button
                                    className={`tab ${activeTab === 'batches' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('batches')}
                                >
                                    📦 Batches ({selectedCourse.batches?.length || 0})
                                </button>
                                <button
                                    className={`tab ${activeTab === 'curriculum' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('curriculum')}
                                >
                                    📖 Curriculum ({selectedCourse.curriculum?.length || 0})
                                </button>
                                <button
                                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('settings')}
                                >
                                    ⚙️ Settings
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {activeTab === 'overview' && (
                                    <div className="overview-tab">
                                        <div className="info-grid">
                                            <div className="info-card">
                                                <label>Course ID</label>
                                                <p>{selectedCourse.id}</p>
                                            </div>
                                            <div className="info-card">
                                                <label>Level</label>
                                                <p>{selectedCourse.level}</p>
                                            </div>
                                            <div className="info-card">
                                                <label>Duration</label>
                                                <p>{selectedCourse.duration}</p>
                                            </div>
                                            <div className="info-card">
                                                <label>Total Lessons</label>
                                                <p>{selectedCourse.lessons}</p>
                                            </div>
                                            <div className="info-card">
                                                <label>Max Capacity</label>
                                                <p>{selectedCourse.maxCapacity} students</p>
                                            </div>
                                            <div className="info-card">
                                                <label>Price</label>
                                                <p>${selectedCourse.price} <span className="original-price">${selectedCourse.originalPrice}</span></p>
                                            </div>
                                        </div>

                                        <div className="description-section">
                                            <h3>Description</h3>
                                            <p>{selectedCourse.description}</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'batches' && (
                                    <div className="batches-tab">
                                        <div className="tab-header">
                                            <h3>Manage Batches</h3>
                                            <button className="btn-primary">+ Add Batch</button>
                                        </div>

                                        <div className="batches-list">
                                            {selectedCourse.batches?.map(batch => (
                                                <div key={batch.batchNumber} className="batch-card">
                                                    <div className="batch-header">
                                                        <h4>Batch {batch.batchNumber}: {batch.batchName}</h4>
                                                        <span className={`status-badge status-${batch.status}`}>
                                                            {batch.status}
                                                        </span>
                                                    </div>
                                                    <div className="batch-details">
                                                        <p><strong>Dates:</strong> {batch.startDate} to {batch.endDate}</p>
                                                        <p><strong>Capacity:</strong> {batch.enrollmentCount}/{batch.maxCapacity}</p>
                                                        <p><strong>Videos:</strong> {batch.videos?.length || 0} uploaded</p>
                                                        <p><strong>Schedule:</strong> {batch.schedule?.length || 0} sessions</p>
                                                    </div>
                                                    <div className="batch-actions">
                                                        <button className="btn-sm btn-secondary">✏️ Edit</button>
                                                        <button className="btn-sm btn-info">🎥 Manage Videos</button>
                                                        <button className="btn-sm btn-info">📅 Manage Schedule</button>
                                                        <button className="btn-sm btn-danger">🗑️ Delete</button>
                                                    </div>
                                                </div>
                                            ))}

                                            {(!selectedCourse.batches || selectedCourse.batches.length === 0) && (
                                                <div className="empty-state">
                                                    <p>No batches yet. Click "+ Add Batch" to create one.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <div className="curriculum-tab">
                                        <div className="tab-header">
                                            <h3>Course Curriculum</h3>
                                            <button className="btn-primary">+ Add Section</button>
                                        </div>

                                        <div className="curriculum-sections">
                                            {selectedCourse.curriculum?.map((section, index) => (
                                                <div key={index} className="curriculum-section">
                                                    <div className="section-header">
                                                        <h4>{section.section}</h4>
                                                        <button className="btn-sm btn-secondary">✏️ Edit</button>
                                                    </div>
                                                    {section.description && (
                                                        <p className="section-description">{section.description}</p>
                                                    )}
                                                    <div className="topics-list">
                                                        <strong>Topics ({Array.isArray(section.topics) ? section.topics.length : 0}):</strong>
                                                        <ul>
                                                            {Array.isArray(section.topics) ? (
                                                                section.topics.map((topic, topicIndex) => (
                                                                    <li key={topicIndex}>
                                                                        {typeof topic === 'string' ? topic : topic.title}
                                                                    </li>
                                                                ))
                                                            ) : null}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="settings-tab">
                                        <h3>Course Settings</h3>
                                        <div className="settings-form">
                                            <div className="form-group">
                                                <label>Coming Soon Status</label>
                                                <select value={selectedCourse.comingSoon ? 'true' : 'false'}>
                                                    <option value="false">Active (Available for enrollment)</option>
                                                    <option value="true">Coming Soon</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Next Batch Date</label>
                                                <input type="date" defaultValue={selectedCourse.nextBatchDate} />
                                            </div>
                                            <div className="form-group">
                                                <label>Category</label>
                                                <input type="text" defaultValue={selectedCourse.category} />
                                            </div>
                                            <button className="btn-primary">Save Settings</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseManagement;
