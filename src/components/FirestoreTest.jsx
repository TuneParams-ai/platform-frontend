// src/components/FirestoreTest.jsx
// Component to test Firestore database connection and operations
import React, { useState } from 'react';
import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

const FirestoreTest = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const addResult = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setResults(prev => [...prev, { message, type, timestamp }]);
    };

    const clearResults = () => {
        setResults([]);
    };

    // Test 1: Check Firestore connection
    const testConnection = async () => {
        addResult('🔍 Testing Firestore connection...', 'info');

        if (!isFirebaseConfigured) {
            addResult('❌ Firebase not configured', 'error');
            return;
        }

        if (!db) {
            addResult('❌ Firestore database not initialized', 'error');
            return;
        }

        addResult('✅ Firestore database connected successfully!', 'success');
    };

    // Test 2: Write test data
    const testWrite = async () => {
        if (!user) {
            addResult('❌ Please sign in first to test database writes', 'error');
            return;
        }

        addResult('📝 Testing database write...', 'info');
        setLoading(true);

        try {
            const testData = {
                userId: user.uid,
                userEmail: user.email,
                testMessage: 'Hello from Firestore!',
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'test_collection'), testData);
            addResult(`✅ Test document written with ID: ${docRef.id}`, 'success');

        } catch (error) {
            addResult(`❌ Write failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Test 3: Read test data
    const testRead = async () => {
        addResult('📖 Testing database read...', 'info');
        setLoading(true);

        try {
            const querySnapshot = await getDocs(collection(db, 'test_collection'));
            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() });
            });

            addResult(`✅ Read ${docs.length} documents from test_collection`, 'success');

            if (docs.length > 0) {
                addResult(`📄 Latest document: ${JSON.stringify(docs[0], null, 2)}`, 'info');
            }

        } catch (error) {
            addResult(`❌ Read failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Test 4: Clean up test data
    const cleanupTestData = async () => {
        addResult('🧹 Cleaning up test data...', 'info');
        setLoading(true);

        try {
            const querySnapshot = await getDocs(collection(db, 'test_collection'));
            const deletePromises = querySnapshot.docs.map(document =>
                deleteDoc(doc(db, 'test_collection', document.id))
            );

            await Promise.all(deletePromises);
            addResult(`✅ Cleaned up ${deletePromises.length} test documents`, 'success');

        } catch (error) {
            addResult(`❌ Cleanup failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Test 5: Test payment service functions
    const testPaymentService = async () => {
        if (!user) {
            addResult('❌ Please sign in first to test payment services', 'error');
            return;
        }

        addResult('💳 Testing payment service functions...', 'info');

        try {
            // Import payment service functions
            const { recordPayment, enrollUserInCourse, checkCourseAccess } = await import('../services/paymentService');

            // Test payment data
            const testPaymentData = {
                paymentID: 'TEST_PAY_123456',
                orderID: 'TEST_ORDER_789',
                payerID: 'TEST_PAYER_001',
                courseId: 'FAAI',
                courseTitle: 'Test Course Enrollment',
                amount: 299,
                payerEmail: user.email,
                payerName: user.displayName || 'Test User',
                transactionStatus: 'COMPLETED',
                timestamp: new Date().toISOString()
            };

            // Test recording payment
            addResult('💰 Testing payment recording...', 'info');
            const paymentResult = await recordPayment(testPaymentData, user.uid);

            if (paymentResult.success) {
                addResult(`✅ Payment recorded with ID: ${paymentResult.paymentRecordId}`, 'success');

                // Test enrollment
                addResult('📚 Testing course enrollment...', 'info');
                const enrollResult = await enrollUserInCourse(user.uid, 'FAAI', testPaymentData);

                if (enrollResult.success) {
                    addResult(`✅ User enrolled with ID: ${enrollResult.enrollmentId}`, 'success');

                    // Test access check
                    addResult('🔐 Testing course access check...', 'info');
                    const accessResult = await checkCourseAccess(user.uid, 'FAAI');

                    if (accessResult.hasAccess) {
                        addResult('✅ Course access verified successfully!', 'success');
                        addResult(`📊 Enrollment data: ${JSON.stringify(accessResult.enrollment, null, 2)}`, 'info');
                    } else {
                        addResult('❌ Course access check failed', 'error');
                    }
                } else {
                    addResult(`❌ Enrollment failed: ${enrollResult.error}`, 'error');
                }
            } else {
                addResult(`❌ Payment recording failed: ${paymentResult.error}`, 'error');
            }

        } catch (error) {
            addResult(`❌ Payment service test failed: ${error.message}`, 'error');
        }
    };

    const getResultColor = (type) => {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'info': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '800px',
            margin: '20px auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            fontFamily: 'monospace'
        }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>🔥 Firestore Database Test Panel</h2>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testConnection}
                    disabled={loading}
                    style={{
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Connection
                </button>

                <button
                    onClick={testWrite}
                    disabled={loading || !user}
                    style={{
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Write
                </button>

                <button
                    onClick={testRead}
                    disabled={loading}
                    style={{
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Read
                </button>

                <button
                    onClick={testPaymentService}
                    disabled={loading || !user}
                    style={{
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Payment Service
                </button>

                <button
                    onClick={cleanupTestData}
                    disabled={loading}
                    style={{
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Cleanup
                </button>

                <button
                    onClick={clearResults}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Results
                </button>
            </div>

            {!user && (
                <div style={{
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    ⚠️ Please sign in to test write operations and payment services
                </div>
            )}

            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                backgroundColor: '#000',
                color: '#fff',
                padding: '16px',
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                {results.length === 0 ? (
                    <div style={{ color: '#6b7280' }}>Click a test button to see results...</div>
                ) : (
                    results.map((result, index) => (
                        <div key={index} style={{
                            marginBottom: '8px',
                            color: getResultColor(result.type)
                        }}>
                            <span style={{ color: '#6b7280' }}>[{result.timestamp}]</span> {result.message}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FirestoreTest;
