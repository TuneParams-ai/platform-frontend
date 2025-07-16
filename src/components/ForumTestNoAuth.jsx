import React, { useState, useEffect } from 'react';
import { getThreads } from '../services/forumServiceSimple';

const ForumTestNoAuth = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadThreads = async () => {
            try {
                const result = await getThreads(null, 10, null);
                if (result.success) {
                    setThreads(result.threads);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadThreads();
    }, []);

    if (loading) return <div>Loading threads...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Forum Test (No Auth)</h1>
            <p>This component tests forum loading without any authentication checks.</p>
            <p>Found {threads.length} threads</p>

            {threads.map(thread => (
                <div key={thread.id} style={{
                    border: '1px solid #ddd',
                    margin: '10px 0',
                    padding: '15px',
                    borderRadius: '5px'
                }}>
                    <h3>{thread.title}</h3>
                    <p>By: {thread.authorName}</p>
                    <p>Category: {thread.category}</p>
                    <p>Replies: {thread.replyCount}</p>
                    <p>Views: {thread.viewCount}</p>
                </div>
            ))}
        </div>
    );
};

export default ForumTestNoAuth;
