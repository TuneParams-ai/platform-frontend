import React, { useState, useRef, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import '../styles/protected-video-player.css';

const ProtectedVideoPlayer = ({ videoPath, videoUrl, videoType = 'firebase', title, onClose }) => {
    const [loadedVideoUrl, setLoadedVideoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const loadVideo = async () => {
            try {
                setLoading(true);
                setError(null);

                if (videoType === 'youtube') {
                    // For YouTube, use the provided URL directly
                    setLoadedVideoUrl(videoUrl);
                    setLoading(false);
                } else if (videoType === 'firebase' && videoPath) {
                    // Get download URL from Firebase Storage
                    const storageRef = ref(storage, videoPath);
                    const url = await getDownloadURL(storageRef);
                    setLoadedVideoUrl(url);
                    setLoading(false);
                } else if (videoUrl) {
                    // Direct URL (for other sources)
                    setLoadedVideoUrl(videoUrl);
                    setLoading(false);
                } else {
                    throw new Error('No valid video source provided');
                }
            } catch (err) {
                console.error('Error loading video:', err);
                setError('Failed to load video. Please try again later.');
                setLoading(false);
            }
        };

        loadVideo();
    }, [videoPath, videoUrl, videoType]);

    // Prevent right-click on video
    const handleContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    // Prevent keyboard shortcuts for download
    const handleKeyDown = (e) => {
        // Prevent Ctrl+S, Ctrl+Shift+S (Save)
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            return false;
        }
    };

    useEffect(() => {
        // Add event listeners
        const container = containerRef.current;
        if (container) {
            container.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup
        return () => {
            if (container) {
                container.removeEventListener('contextmenu', handleContextMenu);
            }
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="video-player-modal" onClick={onClose}>
            <div
                className="video-player-container"
                onClick={(e) => e.stopPropagation()}
                ref={containerRef}
                onContextMenu={handleContextMenu}
            >
                <div className="video-player-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="video-wrapper">
                    {loading && (
                        <div className="video-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading video...</p>
                        </div>
                    )}

                    {error && (
                        <div className="video-error">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()}>
                                Retry
                            </button>
                        </div>
                    )}

                    {loadedVideoUrl && !loading && !error && (
                        <>
                            {videoType === 'youtube' ? (
                                <iframe
                                    ref={videoRef}
                                    src={loadedVideoUrl}
                                    title={title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="protected-video youtube-video"
                                    onContextMenu={handleContextMenu}
                                ></iframe>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        controls
                                        controlsList="nodownload"
                                        disablePictureInPicture
                                        onContextMenu={handleContextMenu}
                                        className="protected-video"
                                    >
                                        <source src={loadedVideoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="video-overlay" onContextMenu={handleContextMenu}></div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="video-player-footer">
                    <p className="video-notice">
                        {videoType === 'youtube' ? (
                            <>🎓 This is an unlisted video for enrolled students only. Please do not share the link.</>
                        ) : (
                            <>🔒 This video is protected and for enrolled students only</>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProtectedVideoPlayer;
