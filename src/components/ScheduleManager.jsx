import React, { useState, useEffect } from 'react';
// import { addBatchSchedule, updateBatchSchedule, deleteBatchSchedule } from '../services/courseManagementService';
import '../styles/schedule-manager.css';

const ScheduleManager = ({ course, batch, onClose, onSave }) => {
    const [schedule, setSchedule] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        topic: '',
        meetingLink: '',
        duration: '90'
    });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (batch?.schedule) {
            setSchedule(batch.schedule || []);
        }
    }, [batch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const sessionData = {
                ...formData,
                createdAt: new Date().toISOString()
            };

            if (editingIndex !== null) {
                // For embedded data, update locally and then update the batch
                const updatedSchedule = [...schedule];
                updatedSchedule[editingIndex] = sessionData;
                setSchedule(updatedSchedule);
                // In a real app, you'd call a service to update the batch
                // await updateBatchSchedule(course.id, batch.id, editingIndex, sessionData);
            } else {
                // Add new session
                setSchedule([...schedule, sessionData]);
                // await addBatchSchedule(course.id, batch.id, sessionData);
            }

            onSave();
            resetForm();
        } catch (err) {
            setError(err.message || `Failed to ${editingIndex !== null ? 'update' : 'add'} session`);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (index) => {
        const session = schedule[index];
        setFormData({
            date: session.date || '',
            time: session.time || '',
            topic: session.topic || '',
            meetingLink: session.meetingLink || '',
            duration: session.duration || '90'
        });
        setEditingIndex(index);
        setShowAddForm(true);
    };

    const handleDelete = async (index) => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;

        setSaving(true);
        setError(null);

        try {
            const updatedSchedule = schedule.filter((_, i) => i !== index);
            setSchedule(updatedSchedule);
            // await deleteBatchSchedule(course.id, batch.id, index);
            onSave();
        } catch (err) {
            setError(err.message || 'Failed to delete session');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            date: '',
            time: '',
            topic: '',
            meetingLink: '',
            duration: '90'
        });
        setEditingIndex(null);
        setShowAddForm(false);
    };

    const formatDateTime = (date, time) => {
        if (!date) return 'No date set';
        const dateObj = new Date(date + 'T' + (time || '00:00'));
        return dateObj.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isPastSession = (date, time) => {
        if (!date) return false;
        const sessionDate = new Date(date + 'T' + (time || '00:00'));
        return sessionDate < new Date();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content schedule-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📅 Manage Schedule - {batch?.batchName || 'Batch'}</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modal-body">
                    {/* Schedule List */}
                    <div className="schedule-list">
                        <div className="schedule-list-header">
                            <h3>Sessions ({schedule.length})</h3>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddForm(true)}
                                disabled={showAddForm}
                            >
                                + Add Session
                            </button>
                        </div>

                        {schedule.length === 0 && !showAddForm && (
                            <div className="empty-state">
                                <p>No sessions scheduled yet. Click "Add Session" to create one.</p>
                            </div>
                        )}

                        {schedule.map((session, index) => (
                            <div
                                key={index}
                                className={`schedule-item ${isPastSession(session.date, session.time) ? 'past' : 'upcoming'}`}
                            >
                                <div className="schedule-icon">
                                    {isPastSession(session.date, session.time) ? '✓' : '📆'}
                                </div>
                                <div className="schedule-info">
                                    <h4>{session.topic}</h4>
                                    <div className="schedule-meta">
                                        <span className="schedule-datetime">
                                            {formatDateTime(session.date, session.time)}
                                        </span>
                                        <span className="schedule-duration">
                                            {session.duration} minutes
                                        </span>
                                    </div>
                                    {session.meetingLink && (
                                        <a
                                            href={session.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="meeting-link"
                                        >
                                            Join Meeting →
                                        </a>
                                    )}
                                </div>
                                <div className="schedule-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleEdit(index)}
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDelete(index)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add/Edit Form */}
                    {showAddForm && (
                        <div className="schedule-form">
                            <h3>{editingIndex !== null ? 'Edit Session' : 'Add New Session'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label htmlFor="topic">Session Topic *</label>
                                        <input
                                            type="text"
                                            id="topic"
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Introduction to Neural Networks"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="date">Date *</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="time">Time *</label>
                                        <input
                                            type="time"
                                            id="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="duration">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            id="duration"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            min="15"
                                            max="480"
                                            step="15"
                                            placeholder="90"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="meetingLink">Meeting Link (Zoom/Google Meet)</label>
                                        <input
                                            type="url"
                                            id="meetingLink"
                                            name="meetingLink"
                                            value={formData.meetingLink}
                                            onChange={handleInputChange}
                                            placeholder="https://zoom.us/j/..."
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : (editingIndex !== null ? 'Update Session' : 'Add Session')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleManager;
