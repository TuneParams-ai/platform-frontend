import React, { useState } from 'react';
// import { addBatchVideo, updateBatchVideo, deleteBatchVideo } from '../services/courseManagementService';
import '../styles/video-manager.css';

const VideoManager = ({ course, batchNumber, onClose, onSave, showNotification }) => {
    const batch = course.batches?.find(b => b.batchNumber === batchNumber);
    const [videos, setVideos] = useState(batch?.videos || []);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        youtubeUrl: '',
        thumbnail: null
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const extractVideoId = (url) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddVideo = () => {
        if (!formData.title.trim() || !formData.youtubeUrl.trim()) {
            setError('Please provide both title and YouTube URL');
            if (showNotification) {
                showNotification('Please provide both title and YouTube URL', 'error');
            }
            return;
        }

        const videoId = extractVideoId(formData.youtubeUrl);
        if (!videoId) {
            setError('Invalid YouTube URL');
            if (showNotification) {
                showNotification('Invalid YouTube URL format', 'error');
            }
            return;
        }

        const newVideo = {
            title: formData.title.trim(),
            youtubeUrl: formData.youtubeUrl.trim(),
            thumbnail: formData.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };

        if (editingIndex !== null) {
            const updatedVideos = [...videos];
            updatedVideos[editingIndex] = newVideo;
            setVideos(updatedVideos);
            setEditingIndex(null);
            if (showNotification) {
                showNotification('Video updated successfully', 'success');
            }
        } else {
            setVideos([...videos, newVideo]);
            if (showNotification) {
                showNotification('Video added successfully', 'success');
            }
        }

        setFormData({ title: '', youtubeUrl: '', thumbnail: null });
        setError(null);
    };

    const handleEditVideo = (index) => {
        const video = videos[index];
        setFormData({
            title: video.title,
            youtubeUrl: video.youtubeUrl,
            thumbnail: video.thumbnail
        });
        setEditingIndex(index);
    };

    const handleDeleteVideo = (index) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            setVideos(videos.filter((_, i) => i !== index));
            if (showNotification) {
                showNotification('Video deleted successfully', 'success');
            }
        }
    };

    const handleMoveUp = (index) => {
        if (index > 0) {
            const newVideos = [...videos];
            [newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]];
            setVideos(newVideos);
        }
    };

    const handleMoveDown = (index) => {
        if (index < videos.length - 1) {
            const newVideos = [...videos];
            [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
            setVideos(newVideos);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            // Update the batch with new videos array
            // TODO: Implement batch update with videos array
            // await updateBatchVideo(course.id, batchNumber, videos);
            if (showNotification) {
                showNotification('Videos saved successfully', 'success');
            }
            onSave();
            onClose();
        } catch (err) {
            const errorMsg = err.message || 'Failed to save videos';
            setError(errorMsg);
            if (showNotification) {
                showNotification(errorMsg, 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content video-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🎥 Manage Videos - Batch {batchNumber}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="video-manager-content">
                    {/* Add/Edit Video Form */}
                    <div className="video-form-section">
                        <h3>{editingIndex !== null ? 'Edit Video' : 'Add New Video'}</h3>
                        <div className="video-form">
                            <div className="form-group">
                                <label htmlFor="title">Video Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Week 1 - Introduction to AI"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="youtubeUrl">YouTube URL *</label>
                                <input
                                    type="url"
                                    id="youtubeUrl"
                                    name="youtubeUrl"
                                    value={formData.youtubeUrl}
                                    onChange={handleChange}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                            <div className="form-actions">
                                {editingIndex !== null && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => {
                                            setEditingIndex(null);
                                            setFormData({ title: '', youtubeUrl: '', thumbnail: null });
                                        }}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleAddVideo}
                                >
                                    {editingIndex !== null ? 'Update Video' : '+ Add Video'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Videos List */}
                    <div className="videos-list-section">
                        <h3>Videos ({videos.length})</h3>
                        {videos.length === 0 ? (
                            <div className="empty-state">
                                <p>No videos added yet</p>
                            </div>
                        ) : (
                            <div className="videos-list">
                                {videos.map((video, index) => (
                                    <div key={index} className="video-item">
                                        <div className="video-info">
                                            <span className="video-number">#{index + 1}</span>
                                            <div className="video-details">
                                                <h4>{video.title}</h4>
                                                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                                    {video.youtubeUrl}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="video-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                                title="Move up"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === videos.length - 1}
                                                title="Move down"
                                            >
                                                ▼
                                            </button>
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => handleEditVideo(index)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDeleteVideo(index)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save All Videos'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoManager;
