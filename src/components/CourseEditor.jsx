import React, { useState, useEffect } from 'react';
import { updateCourse } from '../services/courseManagementService';
import '../styles/course-editor.css';

const CourseEditor = ({ course, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: '',
        duration: '',
        lessons: 0,
        maxCapacity: 0,
        price: 0,
        originalPrice: 0,
        category: '',
        icon: '',
        nextBatchDate: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                level: course.level || '',
                duration: course.duration || '',
                lessons: course.lessons || 0,
                maxCapacity: course.maxCapacity || 0,
                price: course.price || 0,
                originalPrice: course.originalPrice || 0,
                category: course.category || '',
                icon: course.icon || '',
                nextBatchDate: course.nextBatchDate || ''
            });
        }
    }, [course]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await updateCourse(course.id, formData);
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update course');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content course-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>✏️ Edit Course Information</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="course-editor-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="title">Course Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="icon">Icon (Emoji)</label>
                            <input
                                type="text"
                                id="icon"
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                                placeholder="🤖"
                                maxLength="2"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="level">Level *</label>
                            <input
                                type="text"
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                placeholder="Beginner level"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Artificial Intelligence"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration">Duration</label>
                            <input
                                type="text"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="Approximately 15 weeks"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lessons">Total Lessons</label>
                            <input
                                type="number"
                                id="lessons"
                                name="lessons"
                                value={formData.lessons}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxCapacity">Max Capacity per Batch</label>
                            <input
                                type="number"
                                id="maxCapacity"
                                name="maxCapacity"
                                value={formData.maxCapacity}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Current Price ($)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="originalPrice">Original Price ($)</label>
                            <input
                                type="number"
                                id="originalPrice"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nextBatchDate">Next Batch Date</label>
                            <input
                                type="date"
                                id="nextBatchDate"
                                name="nextBatchDate"
                                value={formData.nextBatchDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseEditor;
