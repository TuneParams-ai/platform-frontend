// src/components/AdminSearch.jsx
// Simple search component for admin dashboard - shows raw data like Firestore
import React, { useState } from 'react';
import { globalSearch } from '../services/searchService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const testCouponsDirectly = async () => {
        try {
            console.log('Testing direct coupon access...');
            const couponsSnapshot = await getDocs(collection(db, 'coupons'));
            console.log('Direct coupon query result:', couponsSnapshot);
            console.log('Number of coupon docs:', couponsSnapshot.size);
            
            const coupons = [];
            couponsSnapshot.forEach((doc) => {
                const data = doc.data();
                coupons.push({ id: doc.id, ...data });
                console.log('Coupon doc:', doc.id, data);
                if (data.code) {
                    console.log('Coupon code found:', data.code);
                }
            });
            
            console.log('All coupons:', coupons);
            return coupons;
        } catch (error) {
            console.error('Error accessing coupons directly:', error);
            throw error;
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Searching for:', searchTerm);
            
            // First test direct access to coupons
            await testCouponsDirectly();
            
            // Then do the global search
            const result = await globalSearch(searchTerm);
            console.log('Search result:', result);

            if (result.success) {
                setSearchResults(result.results);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Search failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleString();
        }
        return new Date(timestamp).toLocaleString();
    };

    const formatValue = (key, value) => {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'object' && value.toDate) {
            return formatTimestamp(value);
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2>🔍 Search All Collections</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Search across: users, coupons, emails_sent, forum_threads, enrollments, payments, coupon_usage, course_reviews
            </p>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search across all collections... (try: C4GHPCLDMF8PH9P6)"
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px'
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
                <button
                    onClick={testCouponsDirectly}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Test Coupons
                </button>
            </div>

            <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                💡 <strong>Debug tip:</strong> Open browser console (F12) to see detailed search logs
            </div>

            {error && (
                <div style={{
                    color: 'red',
                    backgroundColor: '#ffebee',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    Error: {error}
                </div>
            )}

            {searchResults.length === 0 && searchTerm.trim() && !loading && (
                <div style={{
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    padding: '20px',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    No results found for "{searchTerm}"
                </div>
            )}

            {searchResults.map((collectionResult, collectionIndex) => (
                <div key={collectionIndex} style={{ marginBottom: '30px' }}>
                    <h3 style={{
                        color: '#333',
                        borderBottom: '2px solid #007bff',
                        paddingBottom: '10px',
                        marginBottom: '15px'
                    }}>
                        Collection: {collectionResult.collection} ({collectionResult.totalCount} results)
                    </h3>

                    {collectionResult.results.map((item, itemIndex) => (
                        <div
                            key={item.id || itemIndex}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                backgroundColor: '#fafafa'
                            }}
                        >
                            <div style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '8px 12px',
                                fontWeight: 'bold',
                                borderRadius: '4px 4px 0 0'
                            }}>
                                Document ID: {item.id}
                            </div>

                            <div style={{ padding: '12px' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '14px'
                                }}>
                                    <tbody>
                                        {Object.entries(item)
                                            .filter(([key]) => key !== 'id')
                                            .map(([key, value]) => (
                                                <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{
                                                        padding: '8px',
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#f8f9fa',
                                                        width: '200px',
                                                        verticalAlign: 'top'
                                                    }}>
                                                        {key}
                                                    </td>
                                                    <td style={{
                                                        padding: '8px',
                                                        wordBreak: 'break-word',
                                                        maxWidth: '400px'
                                                    }}>
                                                        <pre style={{
                                                            margin: 0,
                                                            whiteSpace: 'pre-wrap',
                                                            fontFamily: 'monospace',
                                                            fontSize: '12px',
                                                            maxHeight: '200px',
                                                            overflow: 'auto'
                                                        }}>
                                                            {formatValue(key, value)}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default AdminSearch;
