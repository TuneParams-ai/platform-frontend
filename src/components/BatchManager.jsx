import React, { useState, useEffect } from 'react';
import { createBatch, updateBatch, deleteBatch } from '../services/courseManagementService';
import '../styles/batch-manager.css';

const BatchManager = ({ course, batch, onClose, onSave }) => {
    const isEditMode = !!batch;
    const [batchId, setBatchId] = useState(null); // Store the Firestore document ID
    const [formData, setFormData] = useState({
        batchNumber: 1,
        batchName: '',
        startDate: '',
        endDate: '',
        status: 'upcoming',
        maxCapacity: 30,
        enrollmentCount: 0,
        classLinks: {
            zoom: '',
            discord: ''
        }
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (batch) {
            setBatchId(batch.id); // Store the Firestore document ID
            setFormData({
                batchNumber: batch.batchNumber || 1,
                batchName: batch.batchName || '',
                startDate: batch.startDate || '',
                endDate: batch.endDate || '',
                status: batch.status || 'upcoming',
                maxCapacity: batch.maxCapacity || 30,
                enrollmentCount: batch.enrollmentCount || 0,
                classLinks: {
                    zoom: batch.classLinks?.zoom || '',
                    discord: batch.classLinks?.discord || ''
                }
            });
        } else {
            setBatchId(null);
            // Auto-generate batch number for new batch
            const nextBatchNumber = (course.batches?.length || 0) + 1;
            setFormData(prev => ({ ...prev, batchNumber: nextBatchNumber }));
        }
    }, [batch, course]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (name.startsWith('classLinks.')) {
            const linkType = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                classLinks: {
                    ...prev.classLinks,
                    [linkType]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) || 0 : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (isEditMode) {
                // Use the stored batchId (Firestore document ID) for updates
                await updateBatch(course.id, batchId, formData);
            } else {
                await createBatch(course.id, {
                    ...formData,
                    schedule: [],
                    videos: []
                });
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} batch`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete Batch ${formData.batchNumber}? This action cannot be undone.`)) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // Use the stored batchId (Firestore document ID) for deletion
            await deleteBatch(course.id, batchId);
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to delete batch');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content batch-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? '✏️ Edit Batch' : '➕ Add New Batch'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="batch-manager-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="batchNumber">Batch Number *</label>
                            <input
                                type="number"
                                id="batchNumber"
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                required
                                min="1"
                                disabled={isEditMode}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="batchName">Batch Name *</label>
                            <input
                                type="text"
                                id="batchName"
                                name="batchName"
                                value={formData.batchName}
                                onChange={handleChange}
                                placeholder="e.g., Alpha, Beta"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="startDate">Start Date *</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDate">End Date *</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Status *</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxCapacity">Max Capacity *</label>
                            <input
                                type="number"
                                id="maxCapacity"
                                name="maxCapacity"
                                value={formData.maxCapacity}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="zoom">Zoom Link</label>
                            <input
                                type="url"
                                id="zoom"
                                name="classLinks.zoom"
                                value={formData.classLinks.zoom}
                                onChange={handleChange}
                                placeholder="https://zoom.us/j/..."
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="discord">Discord Link</label>
                            <input
                                type="url"
                                id="discord"
                                name="classLinks.discord"
                                value={formData.classLinks.discord}
                                onChange={handleChange}
                                placeholder="https://discord.gg/..."
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        {isEditMode && (
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                Delete Batch
                            </button>
                        )}
                        <div style={{ flex: 1 }}></div>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (isEditMode ? 'Update Batch' : 'Create Batch')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchManager;
