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

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters long';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be less than 200 characters long';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        } else if (formData.content.length < 10) {
            newErrors.content = 'Content must be at least 10 characters long';
        } else if (formData.content.length > 5000) {
            newErrors.content = 'Content must be less than 5000 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear specific field error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
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
            <div className="modal-content create-thread-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-content">
                        <h2>Start a New Discussion</h2>
                        <p className="modal-subtitle">Share your thoughts and connect with the community</p>
                    </div>
                    <button onClick={onClose} className="close-btn" aria-label="Close modal">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group form-group-title">
                            <label htmlFor="title">
                                <span className="label-text">Discussion Title</span>
                                <span className="label-required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter a clear and descriptive title..."
                                className={errors.title ? 'input-error' : ''}
                                maxLength="200"
                                required
                            />
                            <div className="input-helper-row">
                                <small className="input-helper">A good title helps others understand your discussion</small>
                                <small className="char-counter">
                                    {formData.title.length}/200
                                </small>
                            </div>
                            {errors.title && <p className="error-text">{errors.title}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group form-group-category">
                            <label htmlFor="category">
                                <span className="label-text">Category</span>
                                <span className="label-required">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="select-styled"
                            >
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group form-group-content">
                            <label htmlFor="content">
                                <span className="label-text">Content</span>
                                <span className="label-required">*</span>
                            </label>
                            <div className="content-input-wrapper">
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Share your thoughts, questions, or ideas with the community. Be descriptive and helpful to get the best responses..."
                                    rows="10"
                                    className={errors.content ? 'input-error' : ''}
                                    maxLength="5000"
                                    required
                                ></textarea>
                                <div className="content-helper">
                                    <div className="helper-row">
                                        <small>Tip: Use clear formatting and provide context for better engagement</small>
                                        <small className="char-counter">
                                            {formData.content.length}/5000 characters
                                        </small>
                                    </div>
                                </div>
                            </div>
                            {errors.content && <p className="error-text">{errors.content}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group form-group-tags">
                            <label htmlFor="tags">
                                <span className="label-text">Tags</span>
                                <span className="label-optional">(optional)</span>
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g., python, machine-learning, career-advice"
                                className="tags-input"
                            />
                            <small className="input-helper">Separate tags with commas to help others find your discussion</small>
                        </div>
                    </div>

                    {errors.form && (
                        <div className="form-error-container">
                            <div className="form-error-icon">⚠️</div>
                            <p className="error-text form-error">{errors.form}</p>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="loading-spinner-small"></span>
                                    Posting...
                                </>
                            ) : (
                                'Post Discussion'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateThreadModal;
