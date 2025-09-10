// src/components/MaterialsUpload.jsx
// Component for instructors to upload and manage course materials

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    uploadMaterial,
    createMaterial,
    getMaterialsForBatch,
    deleteMaterial,
    validateFileType,
    validateFileSize,
    getSupportedFileTypes,
    getFileSizeLimits
} from '../services/materialsService';
import '../styles/materials-upload.css';

const MaterialsUpload = () => {
    const { courseId, batchNumber } = useParams();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [activeWeek, setActiveWeek] = useState(1);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        materialType: 'document',
        week: 1,
        order: 1,
        isRequired: true,
        file: null
    });

    const materialTypes = [
        { value: 'video', label: 'Video Lecture' },
        { value: 'slides', label: 'Slides/Presentation' },
        { value: 'assignment', label: 'Assignment' },
        { value: 'notebook', label: 'Jupyter Notebook' },
        { value: 'dataset', label: 'Dataset' },
        { value: 'document', label: 'Document' },
        { value: 'image', label: 'Image/Diagram' }
    ];

    useEffect(() => {
        loadMaterials();
    }, [courseId, batchNumber]);

    const loadMaterials = async () => {
        setLoading(true);
        try {
            const result = await getMaterialsForBatch(courseId, parseInt(batchNumber));
            if (result.success) {
                setMaterials(result.materials);
            }
        } catch (error) {
            console.error('Error loading materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!validateFileType(file, uploadData.materialType)) {
            const supportedTypes = getSupportedFileTypes()[uploadData.materialType];
            alert(`Invalid file type. Supported types for ${uploadData.materialType}: ${supportedTypes.join(', ')}`);
            return;
        }

        // Validate file size
        if (!validateFileSize(file, uploadData.materialType)) {
            const sizeLimits = getFileSizeLimits();
            alert(`File too large. Maximum size for ${uploadData.materialType}: ${sizeLimits[uploadData.materialType]}MB`);
            return;
        }

        setUploadData(prev => ({ ...prev, file }));
    };

    const handleUpload = async () => {
        if (!uploadData.file || !uploadData.title.trim()) {
            alert('Please provide a title and select a file');
            return;
        }

        setLoading(true);
        const materialId = `${uploadData.materialType}_${Date.now()}`;
        setUploadProgress(prev => ({ ...prev, [materialId]: 0 }));

        try {
            // Upload file to storage
            const uploadResult = await uploadMaterial(
                uploadData.file,
                courseId,
                parseInt(batchNumber),
                uploadData.week,
                uploadData.materialType
            );

            if (!uploadResult.success) {
                throw new Error(uploadResult.error);
            }

            // Create material entry in database
            const materialData = {
                courseId,
                batchNumber: parseInt(batchNumber),
                title: uploadData.title.trim(),
                description: uploadData.description.trim(),
                materialType: uploadData.materialType,
                week: uploadData.week,
                order: uploadData.order,
                isRequired: uploadData.isRequired,
                downloadURL: uploadResult.downloadURL,
                fileName: uploadData.file.name,
                filePath: uploadResult.filePath,
                fileSize: uploadData.file.size,
                uploadedBy: 'instructor', // Replace with actual user ID
                isActive: true
            };

            const createResult = await createMaterial(materialData);

            if (createResult.success) {
                setUploadProgress(prev => ({ ...prev, [materialId]: 100 }));

                // Reset form
                setUploadData({
                    title: '',
                    description: '',
                    materialType: 'document',
                    week: activeWeek,
                    order: 1,
                    isRequired: true,
                    file: null
                });

                // Clear file input
                const fileInput = document.getElementById('material-file');
                if (fileInput) fileInput.value = '';

                setShowUploadForm(false);
                await loadMaterials();

                alert('Material uploaded successfully!');
            } else {
                throw new Error(createResult.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setLoading(false);
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[materialId];
                return newProgress;
            });
        }
    };

    const handleDeleteMaterial = async (materialId, materialTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${materialTitle}"?`)) {
            return;
        }

        setLoading(true);
        try {
            const result = await deleteMaterial(materialId);
            if (result.success) {
                await loadMaterials();
                alert('Material deleted successfully');
            } else {
                alert(`Delete failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`Delete failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getWeekMaterials = (week) => {
        return materials.find(w => w.week === week)?.materials || [];
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="materials-upload">
            <div className="materials-upload-header">
                <h2>Manage Course Materials</h2>
                <p>Course: {courseId.toUpperCase()} | Batch: {batchNumber}</p>
                <button
                    className="upload-btn primary"
                    onClick={() => setShowUploadForm(true)}
                    disabled={loading}
                >
                    + Upload New Material
                </button>
            </div>

            {/* Upload Form Modal */}
            {showUploadForm && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal">
                        <div className="upload-modal-header">
                            <h3>Upload New Material</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowUploadForm(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="upload-form">
                            <div className="form-group">
                                <label>Material Title*</label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter material title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter material description"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Material Type*</label>
                                    <select
                                        value={uploadData.materialType}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, materialType: e.target.value }))}
                                    >
                                        {materialTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Week*</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={uploadData.week}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, week: parseInt(e.target.value) }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Order</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={uploadData.order}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={uploadData.isRequired}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, isRequired: e.target.checked }))}
                                    />
                                    Required Material
                                </label>
                            </div>

                            <div className="form-group">
                                <label>File*</label>
                                <input
                                    id="material-file"
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept={getSupportedFileTypes()[uploadData.materialType]?.join(',')}
                                />
                                {uploadData.file && (
                                    <div className="file-info">
                                        Selected: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                                    </div>
                                )}
                            </div>

                            <div className="upload-actions">
                                <button
                                    className="upload-btn secondary"
                                    onClick={() => setShowUploadForm(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="upload-btn primary"
                                    onClick={handleUpload}
                                    disabled={loading || !uploadData.file || !uploadData.title.trim()}
                                >
                                    {loading ? 'Uploading...' : 'Upload Material'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Week Navigation */}
            <div className="week-navigation">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(week => (
                    <button
                        key={week}
                        className={`week-btn ${activeWeek === week ? 'active' : ''}`}
                        onClick={() => setActiveWeek(week)}
                    >
                        Week {week}
                        {getWeekMaterials(week).length > 0 && (
                            <span className="material-count">({getWeekMaterials(week).length})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Materials List */}
            <div className="materials-list">
                {loading ? (
                    <div className="loading">Loading materials...</div>
                ) : (
                    <div className="week-materials">
                        <h3>Week {activeWeek} Materials</h3>
                        {getWeekMaterials(activeWeek).length === 0 ? (
                            <div className="no-materials">
                                No materials uploaded for Week {activeWeek} yet.
                            </div>
                        ) : (
                            <div className="materials-grid">
                                {getWeekMaterials(activeWeek).map(material => (
                                    <div key={material.id} className="material-card">
                                        <div className="material-header">
                                            <div className="material-type-badge">
                                                {materialTypes.find(t => t.value === material.materialType)?.label}
                                            </div>
                                            {material.isRequired && (
                                                <div className="required-badge">Required</div>
                                            )}
                                        </div>

                                        <div className="material-content">
                                            <h4>{material.title}</h4>
                                            {material.description && (
                                                <p className="material-description">{material.description}</p>
                                            )}

                                            <div className="material-meta">
                                                <span>File: {material.fileName}</span>
                                                <span>Size: {formatFileSize(material.fileSize)}</span>
                                                <span>Order: {material.order}</span>
                                            </div>
                                        </div>

                                        <div className="material-actions">
                                            <a
                                                href={material.downloadURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="material-btn view"
                                            >
                                                View/Download
                                            </a>
                                            <button
                                                className="material-btn delete"
                                                onClick={() => handleDeleteMaterial(material.id, material.title)}
                                                disabled={loading}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="upload-progress-overlay">
                    <div className="upload-progress">
                        {Object.entries(uploadProgress).map(([id, progress]) => (
                            <div key={id} className="progress-item">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span>{progress}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialsUpload;
