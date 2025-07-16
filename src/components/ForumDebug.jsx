// Debug component to test forum loading without login
import React, { useState, useEffect } from 'react';
import { getThreads } from '../services/forumServiceSimple';

const ForumDebug = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadThreads = async () => {
            try {
                console.log('Loading threads...');
                const result = await getThreads(null, 10, null);
                console.log('Threads result:', result);

                if (result.success) {
                    setThreads(result.threads);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                console.error('Error loading threads:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadThreads();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Forum Debug - Threads without login</h2>
            <p>Found {threads.length} threads</p>
            {threads.map(thread => (
                <div key={thread.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <h3>{thread.title}</h3>
                    <p>Author: {thread.authorName}</p>
                    <p>Replies: {thread.replyCount}</p>
                </div>
            ))}
        </div>
    );
};

export default ForumDebug;
