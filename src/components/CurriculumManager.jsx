import React, { useState, useEffect } from 'react';
import { addCurriculumSection, updateCurriculumSection, deleteCurriculumSection } from '../services/courseManagementService';
import '../styles/curriculum-manager.css';

const CurriculumManager = ({ course, section, sectionIndex, onClose, onSave }) => {
    const isEditMode = section !== null && section !== undefined;
    const [formData, setFormData] = useState({
        section: '',
        description: '',
        topics: ['']
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (section) {
            setFormData({
                section: section.section || '',
                description: section.description || '',
                topics: Array.isArray(section.topics)
                    ? section.topics.map(t => typeof t === 'string' ? t : t.title || '')
                    : ['']
            });
        }
    }, [section]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTopicChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.map((topic, i) => i === index ? value : topic)
        }));
    };

    const addTopic = () => {
        setFormData(prev => ({
            ...prev,
            topics: [...prev.topics, '']
        }));
    };

    const removeTopic = (index) => {
        if (formData.topics.length === 1) {
            alert('A section must have at least one topic');
            return;
        }
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Filter out empty topics
        const cleanedTopics = formData.topics.filter(topic => topic.trim() !== '');
        if (cleanedTopics.length === 0) {
            setError('Please add at least one topic');
            setSaving(false);
            return;
        }

        try {
            const sectionData = {
                ...formData,
                topics: cleanedTopics
            };

            if (isEditMode) {
                await updateCurriculumSection(course.id, sectionIndex, sectionData);
            } else {
                await addCurriculumSection(course.id, sectionData);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} section`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete this section? This action cannot be undone.`)) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await deleteCurriculumSection(course.id, sectionIndex);
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to delete section');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content curriculum-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? '✏️ Edit Section' : '➕ Add Curriculum Section'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="curriculum-manager-form">
                    <div className="form-group">
                        <label htmlFor="section">Section Title *</label>
                        <input
                            type="text"
                            id="section"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            placeholder="e.g., Foundation, Neural Networks"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Brief description of this section"
                        />
                    </div>

                    <div className="form-group">
                        <label>Topics *</label>
                        <div className="topics-list">
                            {formData.topics.map((topic, index) => (
                                <div key={index} className="topic-item">
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => handleTopicChange(index, e.target.value)}
                                        placeholder={`Topic ${index + 1}`}
                                    />
                                    {formData.topics.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-icon btn-danger"
                                            onClick={() => removeTopic(index)}
                                            title="Remove topic"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={addTopic}
                        >
                            + Add Topic
                        </button>
                    </div>

                    <div className="modal-actions">
                        {isEditMode && (
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                Delete Section
                            </button>
                        )}
                        <div style={{ flex: 1 }}></div>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (isEditMode ? 'Update Section' : 'Create Section')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CurriculumManager;
