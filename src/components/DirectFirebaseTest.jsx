import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

const DirectFirebaseTest = () => {
    const [status, setStatus] = useState('Initializing...');
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const testDirectAccess = async () => {
            console.log('🧪 Direct Firebase Test Starting...');
            setStatus('Testing direct Firebase access...');

            try {
                // Check if db is available
                if (!db) {
                    throw new Error('Firestore database not initialized');
                }

                console.log('✅ Firestore database object exists');
                setStatus('Database object exists. Testing query...');

                // Try a direct query
                const reviewsCollection = collection(db, 'course_reviews');
                console.log('✅ Collection reference created');

                const q = query(reviewsCollection, limit(3));
                console.log('✅ Query created');

                setStatus('Executing query...');
                const snapshot = await getDocs(q);
                console.log('✅ Query executed successfully');

                const reviewData = [];
                snapshot.forEach((doc) => {
                    reviewData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                console.log('✅ Data processed:', reviewData);
                setReviews(reviewData);
                setStatus(`Success! Found ${reviewData.length} reviews`);
                setError(null);

            } catch (err) {
                console.error('❌ Direct Firebase test failed:', err);
                setStatus('Failed');
                setError(err.message);
                setReviews([]);
            }
        };

        // Run test after a small delay to ensure everything is loaded
        const timeout = setTimeout(testDirectAccess, 1000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '300px',
            padding: '15px',
            backgroundColor: '#f0f0f0',
            border: '2px solid #333',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 9999
        }}>
            <h4 style={{ margin: '0 0 10px 0' }}>🔧 Direct Firebase Test</h4>
            <div><strong>Status:</strong> {status}</div>

            {error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {reviews.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    <strong>Reviews found:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
                        {reviews.map(review => (
                            <li key={review.id}>
                                {review.userName || 'Anonymous'} - {review.rating}/5
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DirectFirebaseTest;
