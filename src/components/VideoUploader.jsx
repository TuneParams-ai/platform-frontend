import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import '../styles/video-uploader.css';

/**
 * VideoUploader Component - Admin Tool
 * 
 * This is an optional admin component that allows uploading videos
 * directly through the web interface instead of Firebase Console.
 * 
 * To use: Add this component to your AdminDashboard or create a new admin page.
 */
const VideoUploader = ({ courseId, batchNumber }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedPath, setUploadedPath] = useState('');
    const [error, setError] = useState('');

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            // Validate file type
            if (!selectedFile.type.startsWith('video/')) {
                setError('Please select a valid video file');
                return;
            }

            // Check file size (warn if > 2GB)
            const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
            if (selectedFile.size > maxSize) {
                setError('Warning: File is larger than 2GB. Upload may take a while.');
            } else {
                setError('');
            }

            setFile(selectedFile);
            setUploadedPath('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        if (!courseId || !batchNumber) {
            setError('Course ID and Batch Number are required');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setProgress(0);

            // Create storage path
            const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
            const storagePath = `courses/${courseId}/batch${batchNumber}/${fileName}`;
            const storageRef = ref(storage, storagePath);

            // Upload file with progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Track progress
                    const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(Math.round(percent));
                },
                (error) => {
                    // Handle errors
                    console.error('Upload error:', error);
                    setError(`Upload failed: ${error.message}`);
                    setUploading(false);
                },
                async () => {
                    // Upload completed successfully
                    setUploading(false);
                    setUploadedPath(storagePath);
                    setProgress(100);

                    // Clear file input
                    setFile(null);
                }
            );
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(`Error: ${err.message}`);
            setUploading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(uploadedPath);
        alert('Path copied to clipboard!');
    };

    return (
        <div className="video-uploader">
            <h3>Upload Video to Firebase Storage</h3>
            <p className="uploader-description">
                Upload class recordings to Firebase Storage. After upload, copy the path and add it to coursesData.js
            </p>

            <div className="uploader-form">
                <div className="form-group">
                    <label>Course ID:</label>
                    <input type="text" value={courseId} readOnly className="readonly-input" />
                </div>

                <div className="form-group">
                    <label>Batch Number:</label>
                    <input type="text" value={batchNumber} readOnly className="readonly-input" />
                </div>

                <div className="form-group">
                    <label htmlFor="video-file">Select Video File:</label>
                    <input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="file-input"
                    />
                    {file && (
                        <p className="file-info">
                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                {uploading && (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="progress-text">{progress}% uploaded</p>
                    </div>
                )}

                {uploadedPath && (
                    <div className="success-container">
                        <p className="success-message">✓ Upload successful!</p>
                        <div className="path-container">
                            <label>Storage Path (copy this):</label>
                            <div className="path-display">
                                <code>{uploadedPath}</code>
                                <button onClick={copyToClipboard} className="copy-btn">
                                    Copy
                                </button>
                            </div>
                        </div>
                        <div className="next-steps">
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Copy the path above</li>
                                <li>Open <code>src/data/coursesData.js</code></li>
                                <li>Find your batch's <code>videos</code> array</li>
                                <li>Add a new video object with this path</li>
                            </ol>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="upload-btn"
                >
                    {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
            </div>
        </div>
    );
};

export default VideoUploader;
