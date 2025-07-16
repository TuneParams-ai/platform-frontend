import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createThread, FORUM_CATEGORIES, CATEGORY_LABELS } from '../services/forumServiceSimple';
import '../styles/forum.css'; // Ensure you have styles for the modal

const CreateThreadModal = ({ onClose, onThreadCreated }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: FORUM_CATEGORIES.GENERAL,
        tags: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
        if (!formData.content.trim()) newErrors.content = 'Content is required';
        else if (formData.content.length < 10) newErrors.content = 'Content must be at least 10 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const threadData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                authorId: user.uid,
                authorName: user.name || user.displayName || 'Anonymous',
                authorAvatar: user.photoURL || null,
            };

            const result = await createThread(threadData);

            if (result.success) {
                onThreadCreated();
            } else {
                setErrors({ form: result.error });
            }
        } catch (error) {
            setErrors({ form: 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Start a New Discussion</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter a descriptive title"
                            required
                        />
                        {errors.title && <p className="error-text">{errors.title}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Share your thoughts... You can use basic HTML for formatting."
                            rows="8"
                            required
                        ></textarea>
                        {errors.content && <p className="error-text">{errors.content}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">Tags (comma-separated)</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g., python, machine-learning, career"
                        />
                    </div>

                    {errors.form && <p className="error-text form-error">{errors.form}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Posting...' : 'Post Discussion'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateThreadModal;
