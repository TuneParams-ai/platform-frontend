import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

const FirebaseTest = () => {
    const [results, setResults] = useState([]);
    const [reviews, setReviews] = useState([]);
    const { user } = useAuth();

    const addResult = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setResults(prev => [...prev, { timestamp, message, type }]);
    };

    const testReviewsAccess = async () => {
        addResult('Starting Firebase reviews access test...', 'info');
        addResult(`User status: ${user ? 'Logged in as ' + user.email : 'Not logged in'}`, 'info');

        try {
            if (!db) {
                throw new Error('Firestore not initialized');
            }

            addResult('✅ Firestore connected', 'success');

            // Test reading reviews collection
            const reviewsRef = collection(db, 'course_reviews');
            const q = query(reviewsRef, limit(5));

            addResult('🔍 Querying course_reviews collection...', 'info');
            const snapshot = await getDocs(q);

            addResult(`✅ Query successful! Found ${snapshot.docs.length} reviews`, 'success');

            const reviewData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setReviews(reviewData);

            reviewData.forEach((review, index) => {
                addResult(`📝 Review ${index + 1}: ${review.userName || 'Anonymous'} - ${review.rating}/5 stars`, 'info');
            });

        } catch (error) {
            addResult(`❌ Firebase test failed: ${error.message}`, 'error');
            console.error('Firebase test error:', error);
        }
    };

    const clearResults = () => {
        setResults([]);
        setReviews([]);
    };

    // Test on component mount
    useEffect(() => {
        testReviewsAccess();
    }, [user]);

    return (
        <div style={{
            padding: '20px',
            maxWidth: '600px',
            margin: '20px auto',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3>🧪 Firebase Reviews Access Test</h3>

            <div style={{ marginBottom: '15px' }}>
                <button
                    onClick={testReviewsAccess}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    🧪 Test Reviews Access
                </button>

                <button
                    onClick={clearResults}
                    style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Results
                </button>
            </div>

            <div style={{
                backgroundColor: '#000',
                color: '#0f0',
                padding: '15px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '300px',
                overflowY: 'auto'
            }}>
                <div>🔧 Firebase Reviews Test Console:</div>
                {results.length === 0 && (
                    <div style={{ color: '#888' }}>Running tests...</div>
                )}
                {results.map((result, index) => (
                    <div
                        key={index}
                        style={{
                            color: result.type === 'error' ? '#ff6b6b' :
                                result.type === 'success' ? '#51cf66' : '#0f0',
                            margin: '2px 0'
                        }}
                    >
                        [{result.timestamp}] {result.message}
                    </div>
                ))}
            </div>

            {reviews.length > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                    <strong>Reviews Found ({reviews.length}):</strong>
                    <ul>
                        {reviews.map(review => (
                            <li key={review.id} style={{ margin: '5px 0' }}>
                                <strong>{review.userName || 'Anonymous'}</strong> - {review.rating}/5 stars
                                {review.courseTitle && ` (${review.courseTitle})`}
                                <br />
                                <em style={{ color: '#666', fontSize: '12px' }}>
                                    {review.comment ? review.comment.substring(0, 100) + '...' : 'No comment'}
                                </em>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                <strong>Purpose:</strong> This test checks if Firebase can read reviews when logged in vs logged out.
                The reviews should be readable regardless of authentication status based on Firestore rules.
            </div>
        </div>
    );
};

export default FirebaseTest;
