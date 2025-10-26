import React, { useState } from 'react';
import ProtectedVideoPlayer from './ProtectedVideoPlayer';
import '../styles/video-library.css';

const VideoLibrary = ({ videos, batchNumber }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to get YouTube thumbnail from video ID or URL
    const getYouTubeThumbnail = (youtubeUrl) => {
        if (!youtubeUrl) return null;

        // Extract video ID from various YouTube URL formats
        let videoId = null;

        // Handle youtube.com/watch?v=VIDEO_ID
        const watchMatch = youtubeUrl.match(/[?&]v=([^&]+)/);
        if (watchMatch) videoId = watchMatch[1];

        // Handle youtu.be/VIDEO_ID
        const shortMatch = youtubeUrl.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) videoId = shortMatch[1];

        // Handle youtube.com/embed/VIDEO_ID
        const embedMatch = youtubeUrl.match(/\/embed\/([^?]+)/);
        if (embedMatch) videoId = embedMatch[1];

        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }

        return null;
    };

    // Helper function to convert YouTube URL to embed URL
    const getYouTubeEmbedUrl = (youtubeUrl) => {
        if (!youtubeUrl) return null;

        let videoId = null;

        // Extract video ID from various formats
        const watchMatch = youtubeUrl.match(/[?&]v=([^&]+)/);
        if (watchMatch) videoId = watchMatch[1];

        const shortMatch = youtubeUrl.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) videoId = shortMatch[1];

        const embedMatch = youtubeUrl.match(/\/embed\/([^?]+)/);
        if (embedMatch) videoId = embedMatch[1];

        if (videoId) {
            // Add parameters to disable related videos from other channels and reduce branding
            return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        }

        return youtubeUrl;
    }; if (!videos || videos.length === 0) {
        return (
            <div className="video-library">
                <div className="no-videos">
                    <div className="no-videos-icon">🎥</div>
                    <h3>No Videos Available Yet</h3>
                    <p>Video recordings will be uploaded after each class session.</p>
                </div>
            </div>
        );
    }

    // Filter videos based on search only
    const filteredVideos = videos.filter(video => {
        return video.title.toLowerCase().includes(searchTerm.toLowerCase());
    }); return (
        <div className="video-library">
            <div className="video-library-header">
                <h2>📹 Video Recordings</h2>
                <p>Access all class recordings from your batch</p>
            </div>

            {/* Filters */}
            <div className="video-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="video-search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
            </div>

            {/* Video Count */}
            <div className="video-count">
                <p>Showing {filteredVideos.length} of {videos.length} videos</p>
            </div>

            {/* Video Grid */}
            {filteredVideos.length > 0 ? (
                <div className="video-grid">
                    {filteredVideos.map((video, index) => (
                        <div key={index} className="video-card">
                            <div className="video-thumbnail">
                                <div className="thumbnail-overlay">
                                    <button
                                        className="play-button"
                                        onClick={() => setSelectedVideo(video)}
                                        aria-label={`Play ${video.title}`}
                                    >
                                        <span className="play-icon">▶</span>
                                    </button>
                                </div>
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt={video.title} />
                                ) : video.youtubeUrl ? (
                                    <img src={getYouTubeThumbnail(video.youtubeUrl)} alt={video.title} onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }} />
                                ) : null}
                                {(!video.thumbnail && !video.youtubeUrl) && (
                                    <div className="default-thumbnail">
                                        <span className="default-icon">🎥</span>
                                    </div>
                                )}
                            </div>

                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <button
                                    className="watch-button"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    Watch Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-results">
                    <p>No videos found matching your search criteria.</p>
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <ProtectedVideoPlayer
                    videoPath={selectedVideo.path}
                    videoUrl={selectedVideo.youtubeUrl ? getYouTubeEmbedUrl(selectedVideo.youtubeUrl) : selectedVideo.url}
                    videoType={selectedVideo.youtubeUrl ? 'youtube' : selectedVideo.path ? 'firebase' : 'direct'}
                    title={selectedVideo.title}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
};

export default VideoLibrary;
