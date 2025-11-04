import React from 'react';
import '../styles/drive-access.css';

const DriveAccess = ({ batch }) => {
    // If no drive links are available, show placeholder
    if (!batch?.driveLinks?.videosFolder && !batch?.driveLinks?.materialsFolder) {
        return (
            <div className="drive-access">
                <div className="drive-access-header">
                    <h2>📁 Course Resources</h2>
                    <p>Access your videos and materials through Google Drive</p>
                </div>

                <div className="drive-access-grid">
                    <div className="drive-card unavailable">
                        <div className="drive-card-icon">🎥</div>
                        <h3>Class Recordings</h3>
                        <p>Video recordings will be available after class sessions</p>
                        <span className="unavailable-text">Coming Soon</span>
                    </div>

                    <div className="drive-card unavailable">
                        <div className="drive-card-icon">📚</div>
                        <h3>Course Materials</h3>
                        <p>PDFs, slides, and additional resources</p>
                        <span className="unavailable-text">Coming Soon</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="drive-access">
            <div className="drive-access-header">
                <h2>📁 Course Resources</h2>
                <p>Access all your course content through Google Drive folders</p>
            </div>

            <div className="drive-access-grid">
                {/* Videos Folder */}
                <div className="drive-card">
                    <div className="drive-card-icon">🎥</div>
                    <h3>Class Recordings</h3>
                    <p>All video recordings from live sessions</p>
                    {batch.driveLinks.videosFolder ? (
                        <a
                            href={batch.driveLinks.videosFolder}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="drive-access-button videos"
                        >
                            <span>Open Videos Folder</span>
                        </a>
                    ) : (
                        <span className="unavailable-text">Videos will be available after classes</span>
                    )}
                </div>

                {/* Materials Folder */}
                <div className="drive-card">
                    <div className="drive-card-icon">📚</div>
                    <h3>Course Materials</h3>
                    <p>PDFs, slides, code files, and additional resources</p>
                    {batch.driveLinks.materialsFolder ? (
                        <a
                            href={batch.driveLinks.materialsFolder}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="drive-access-button materials"
                        >
                            <span>Open Materials Folder</span>
                        </a>
                    ) : (
                        <span className="unavailable-text">Materials will be available soon</span>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="drive-instructions">
                <h4>📋 How to Access Your Files</h4>
                <div className="instructions-grid">
                    <div className="instruction-item">
                        <span className="instruction-number">1</span>
                        <div>
                            <strong>Use the same email for access</strong>
                            <p>Make sure you're logged into Google Drive with the same email you used to register for this course</p>
                        </div>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-number">2</span>
                        <div>
                            <strong>Notebooks and datasets</strong>
                            <p>You can download Python notebooks, datasets, and assignment files needed for your coursework</p>
                        </div>
                    </div>
                    <div className="instruction-item">
                        <span className="instruction-number">3</span>
                        <div>
                            <strong>Check back for updates</strong>
                            <p>New videos and materials are added regularly</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriveAccess;