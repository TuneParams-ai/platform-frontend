import React, { useState } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useUserRole } from '../hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { getCompleteCourse, updateCourse } from '../services/courseManagementService';
import CourseEditor from '../components/CourseEditor';
import BatchManager from '../components/BatchManager';
import CurriculumManager from '../components/CurriculumManager';
import ScheduleManager from '../components/ScheduleManager';
import '../styles/course-management.css';

const CourseManagement = () => {
    const { isAdmin, loading: roleLoading } = useUserRole();
    const { courses, loading: coursesLoading, error, refetch } = useCourses();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(false);
    const [showCourseEditor, setShowCourseEditor] = useState(false);
    const [showBatchManager, setShowBatchManager] = useState(false);
    const [showCurriculumManager, setShowCurriculumManager] = useState(false);
    const [showScheduleManager, setShowScheduleManager] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [editingSection, setEditingSection] = useState({ section: null, index: null });
    const [settingsForm, setSettingsForm] = useState({});
    const [savingSettings, setSavingSettings] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '', show: false });


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

    const handleSave = async () => {
        refetch();
        // Reload the selected course with fresh data including batches and curriculum
        if (selectedCourse) {
            await loadCourseDetails(selectedCourse.id);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type, show: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    const loadCourseDetails = async (courseId) => {
        try {
            setLoadingCourse(true);
            console.log('🔄 Loading complete course data for:', courseId);
            const completeCourse = await getCompleteCourse(courseId);
            console.log('✅ Complete course loaded:', completeCourse);
            console.log('📦 Batches:', completeCourse?.batches);
            console.log('📖 Curriculum:', completeCourse?.curriculum);

            if (!completeCourse.batches || completeCourse.batches.length === 0) {
                console.warn('⚠️ No batches found in course data!');
            }

            setSelectedCourse(completeCourse);
        } catch (err) {
            console.error('❌ Error loading course details:', err);
            console.error('Error details:', {
                message: err.message,
                code: err.code,
                stack: err.stack
            });
            // Fallback to the basic course data from the list
            const basicCourse = courses.find(c => c.id === courseId);
            console.warn('⚠️ Using fallback basic course data:', basicCourse);
            setSelectedCourse(basicCourse);
        } finally {
            setLoadingCourse(false);
        }
    };

    const handleCourseSelect = async (course) => {
        // Load complete course data with batches and curriculum
        await loadCourseDetails(course.id);
        // Initialize settings form when course is selected
        setSettingsForm({
            comingSoon: course.comingSoon || false,
            nextBatchDate: course.nextBatchDate || '',
            category: course.category || ''
        });
    };

    const handleEditBatch = (batch) => {
        setEditingBatch(batch);
        setShowBatchManager(true);
    };

    const handleEditSection = (section, index) => {
        setEditingSection({ section, index });
        setShowCurriculumManager(true);
    };

    const handleManageSchedule = (batch) => {
        setEditingBatch(batch);
        setShowScheduleManager(true);
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettingsForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveSettings = async () => {
        if (!selectedCourse) return;

        setSavingSettings(true);
        try {
            await updateCourse(selectedCourse.id, settingsForm);

            // Update local selected course data
            setSelectedCourse(prev => ({
                ...prev,
                ...settingsForm
            }));

            // Refresh the courses list
            await refetch();

            showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showNotification('Failed to save settings. Please try again.', 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleDeleteBatch = async (batch) => {
        if (!window.confirm(`Are you sure you want to delete ${batch.batchName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const { deleteBatch } = await import('../services/courseManagementService');
            await deleteBatch(selectedCourse.id, batch.id);
            await handleSave();
            showNotification('Batch deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting batch:', error);
            showNotification('Failed to delete batch. Please try again.', 'error');
        }
    };

    return (
        <div className="course-management">
            {/* Notification */}
            {notification.show && (
                <div className={`notification notification-${notification.type}`}>
                    <span>{notification.message}</span>
                    <button className="notification-close" onClick={hideNotification}>×</button>
                </div>
            )}

            <div className="course-management-header">
                <h1>📚 Course Management</h1>
                <p>Manage all course content, batches, videos, and schedules</p>
            </div>

            <div className="course-management-content">
                {/* Sidebar - Course List */}
                <div className="course-management-sidebar">
                    <div className="sidebar-header">
                        <h3>Courses ({courses.length})</h3>
                        <button className="btn-primary">+ New Course</button>
                    </div>

                    <div className="course-list">{courses.map(course => (
                        <div
                            key={course.id}
                            className={`course-item ${selectedCourse?.id === course.id ? 'active' : ''}`}
                            onClick={() => handleCourseSelect(course)}
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
                    ) : loadingCourse ? (
                        <div className="course-loading">
                            <div className="spinner"></div>
                            <p>Loading course details...</p>
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
                                    <button className="btn-secondary" onClick={() => setShowCourseEditor(true)}>
                                        Edit Course Info
                                    </button>
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
                                            <button
                                                className="btn-primary"
                                                onClick={() => {
                                                    setEditingBatch(null);
                                                    setShowBatchManager(true);
                                                }}
                                            >
                                                + Add Batch
                                            </button>
                                        </div>

                                        <div className="batches-list">{selectedCourse.batches?.map(batch => (
                                            <div key={batch.id || batch.batchNumber} className="batch-card">
                                                <div className="batch-header">
                                                    <h4>Batch {batch.batchNumber}: {batch.batchName}</h4>
                                                    <span className={`status-badge status-${batch.status}`}>
                                                        {batch.status}
                                                    </span>
                                                </div>
                                                <div className="batch-details">
                                                    <p><strong>Dates:</strong> {batch.startDate} to {batch.endDate}</p>
                                                    <p><strong>Capacity:</strong> {batch.enrollmentCount}/{batch.maxCapacity}</p>
                                                    <p><strong>Drive Folders:</strong>
                                                        {batch.driveLinks?.videosFolder ? '🎥 Videos' : ''}
                                                        {batch.driveLinks?.videosFolder && batch.driveLinks?.materialsFolder ? ' • ' : ''}
                                                        {batch.driveLinks?.materialsFolder ? '📚 Materials' : ''}
                                                        {!batch.driveLinks?.videosFolder && !batch.driveLinks?.materialsFolder ? 'Not configured' : ''}
                                                    </p>
                                                    <p><strong>Schedule:</strong> {batch.schedule?.length || 0} sessions</p>
                                                </div>
                                                <div className="batch-actions">
                                                    <button
                                                        className="btn-sm btn-secondary"
                                                        onClick={() => handleEditBatch(batch)}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        className="btn-sm btn-info"
                                                        onClick={() => handleManageSchedule(batch)}
                                                    >
                                                        📅 Manage Schedule
                                                    </button>
                                                    <button
                                                        className="btn-sm btn-danger"
                                                        onClick={() => handleDeleteBatch(batch)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
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
                                            <button
                                                className="btn-primary"
                                                onClick={() => {
                                                    setEditingSection({ section: null, index: null });
                                                    setShowCurriculumManager(true);
                                                }}
                                            >
                                                + Add Section
                                            </button>
                                        </div>

                                        <div className="curriculum-sections">
                                            {selectedCourse.curriculum?.map((section, index) => (
                                                <div key={index} className="curriculum-section">
                                                    <div className="section-header">
                                                        <h4>{section.section}</h4>
                                                        <button
                                                            className="btn-sm btn-secondary"
                                                            onClick={() => handleEditSection(section, index)}
                                                        >
                                                            ✏️ Edit
                                                        </button>
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

                                            {(!selectedCourse.curriculum || selectedCourse.curriculum.length === 0) && (
                                                <div className="empty-state">
                                                    <p>No curriculum sections yet. Click "+ Add Section" to create one.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="settings-tab">
                                        <h3>Course Settings</h3>
                                        <div className="settings-form">
                                            <div className="form-group">
                                                <label>Coming Soon Status</label>
                                                <select
                                                    name="comingSoon"
                                                    value={settingsForm.comingSoon ? 'true' : 'false'}
                                                    onChange={(e) => handleSettingsChange({
                                                        target: {
                                                            name: 'comingSoon',
                                                            value: e.target.value === 'true',
                                                            type: 'checkbox',
                                                            checked: e.target.value === 'true'
                                                        }
                                                    })}
                                                >
                                                    <option value="false">Active (Available for enrollment)</option>
                                                    <option value="true">Coming Soon</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Next Batch Date</label>
                                                <input
                                                    type="date"
                                                    name="nextBatchDate"
                                                    value={settingsForm.nextBatchDate || ''}
                                                    onChange={handleSettingsChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Category</label>
                                                <input
                                                    type="text"
                                                    name="category"
                                                    value={settingsForm.category || ''}
                                                    onChange={handleSettingsChange}
                                                    placeholder="e.g., AI, Machine Learning, Web Development"
                                                />
                                            </div>
                                            <button
                                                className="btn-primary"
                                                onClick={handleSaveSettings}
                                                disabled={savingSettings}
                                            >
                                                {savingSettings ? 'Saving...' : 'Save Settings'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCourseEditor && selectedCourse && (
                <CourseEditor
                    course={selectedCourse}
                    onClose={() => setShowCourseEditor(false)}
                    onSave={handleSave}
                />
            )}

            {showBatchManager && selectedCourse && (
                <BatchManager
                    course={selectedCourse}
                    batch={editingBatch}
                    onClose={() => {
                        setShowBatchManager(false);
                        setEditingBatch(null);
                    }}
                    onSave={handleSave}
                    showNotification={showNotification}
                />
            )}

            {showCurriculumManager && selectedCourse && (
                <CurriculumManager
                    course={selectedCourse}
                    section={editingSection.section}
                    sectionIndex={editingSection.index}
                    onClose={() => {
                        setShowCurriculumManager(false);
                        setEditingSection({ section: null, index: null });
                    }}
                    onSave={handleSave}
                    showNotification={showNotification}
                />
            )}

            {showScheduleManager && selectedCourse && editingBatch && (
                <ScheduleManager
                    course={selectedCourse}
                    batch={editingBatch}
                    onClose={() => {
                        setShowScheduleManager(false);
                        setEditingBatch(null);
                    }}
                    onSave={handleSave}
                    showNotification={showNotification}
                />
            )}
        </div>
    );
};

export default CourseManagement;
