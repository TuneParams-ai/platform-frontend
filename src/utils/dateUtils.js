// Date formatting utilities for the forum
export const formatRelativeTime = (date) => {
    if (!date) return 'Unknown';

    const now = new Date();
    const diffTime = now - date;

    // Convert to different time units
    const seconds = Math.floor(diffTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // Return appropriate format based on time difference
    if (seconds < 60) {
        return seconds <= 1 ? 'Just now' : `${seconds} seconds ago`;
    } else if (minutes < 60) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else if (hours < 24) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days < 7) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (weeks < 4) {
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (months < 12) {
        return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
        return years === 1 ? '1 year ago' : `${years} years ago`;
    }
};

// Format date with both relative time and full timestamp
export const formatDateWithTooltip = (date) => {
    if (!date) return { display: 'Unknown', tooltip: 'Unknown' };

    const relativeTime = formatRelativeTime(date);
    const fullDate = date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return {
        display: relativeTime,
        tooltip: fullDate
    };
};

// Short format for compact displays
export const formatShortDate = (date) => {
    if (!date) return 'Unknown';

    const now = new Date();
    const diffTime = now - date;
    const hours = Math.floor(diffTime / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
        const minutes = Math.floor(diffTime / (1000 * 60));
        return minutes < 1 ? 'now' : `${minutes}m`;
    } else if (hours < 24) {
        return `${hours}h`;
    } else if (days < 7) {
        return `${days}d`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
};
