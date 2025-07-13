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

    // Test 4.5: Test user management services
    const testUserManagement = async () => {
        if (!user) {
            addResult('❌ Please sign in first to test user management', 'error');
            return;
        }

        addResult('👤 Testing user management services...', 'info');
        setLoading(true);

        try {
            // Import services
            const { createOrUpdateUserProfile, getUserProfile } = await import('../services/userService');
            const { assignUserRole, getUserRole, USER_ROLES } = await import('../services/roleService');

            // Test user profile creation/update
            addResult('📝 Testing user profile creation...', 'info');
            const userResult = await createOrUpdateUserProfile(user);

            if (userResult.success) {
                addResult('✅ User profile created/updated successfully', 'success');

                // Test profile retrieval
                const profileResult = await getUserProfile(user.uid);
                if (profileResult.success) {
                    addResult(`✅ Profile retrieved: ${profileResult.userData.email}`, 'success');
                } else {
                    addResult(`❌ Profile retrieval failed: ${profileResult.error}`, 'error');
                }
            } else {
                addResult(`❌ User profile creation failed: ${userResult.error}`, 'error');
            }

            // Test role assignment
            addResult('🎭 Testing role assignment...', 'info');
            const roleResult = await assignUserRole(user.uid, USER_ROLES.STUDENT, user.uid);

            if (roleResult.success) {
                addResult('✅ Role assigned successfully', 'success');

                // Test role retrieval
                const userRoleResult = await getUserRole(user.uid);
                addResult(`✅ User role retrieved: ${userRoleResult.role}`, 'success');
            } else {
                addResult(`❌ Role assignment failed: ${roleResult.error}`, 'error');
            }

        } catch (error) {
            addResult(`❌ User management test failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Test 5: Test all collections comprehensively
    const testAllCollections = async () => {
        if (!user) {
            addResult('❌ Please sign in first to test all collections', 'error');
            return;
        }

        addResult('� Testing all Firestore collections...', 'info');
        setLoading(true);

        try {
            // Import all services
            const { recordPayment, enrollUserInCourse, checkCourseAccess } = await import('../services/paymentService');
            const { createOrUpdateUserProfile, getUserProfile } = await import('../services/userService');
            const { assignUserRole, getUserRole, USER_ROLES } = await import('../services/roleService');

            // 1. Test users collection
            addResult('👤 Testing users collection...', 'info');
            const userResult = await createOrUpdateUserProfile(user);
            if (userResult.success) {
                addResult('✅ User profile created/updated successfully', 'success');

                const profileResult = await getUserProfile(user.uid);
                if (profileResult.success) {
                    addResult(`✅ User profile retrieved: ${profileResult.userData.email}`, 'success');
                }
            } else {
                addResult(`❌ User profile test failed: ${userResult.error}`, 'error');
            }

            // 2. Test user_roles collection
            addResult('🎭 Testing user_roles collection...', 'info');
            const roleResult = await assignUserRole(user.uid, USER_ROLES.STUDENT, user.uid);
            if (roleResult.success) {
                addResult('✅ User role assigned successfully', 'success');

                const userRoleResult = await getUserRole(user.uid);
                addResult(`✅ User role retrieved: ${userRoleResult.role}`, 'success');
            } else {
                addResult(`❌ User role test failed: ${roleResult.error}`, 'error');
            }

            // 3. Test payments collection
            addResult('💳 Testing payments collection...', 'info');
            const testPaymentData = {
                paymentID: `TEST_PAY_${Date.now()}`,
                orderID: `TEST_ORDER_${Date.now()}`,
                payerID: 'TEST_PAYER_001',
                courseId: 'FAAI',
                courseTitle: 'Foundations to Frontiers of Artificial Intelligence',
                amount: 299,
                payerEmail: user.email,
                payerName: user.displayName || 'Test User',
                transactionStatus: 'COMPLETED',
                timestamp: new Date().toISOString()
            };

            const paymentResult = await recordPayment(testPaymentData, user.uid);
            if (paymentResult.success) {
                addResult(`✅ Payment recorded with ID: ${paymentResult.paymentRecordId}`, 'success');
            } else {
                addResult(`❌ Payment test failed: ${paymentResult.error}`, 'error');
            }

            // 4. Test enrollments collection
            addResult('📚 Testing enrollments collection...', 'info');
            const enrollResult = await enrollUserInCourse(user.uid, 'FAAI', testPaymentData);
            if (enrollResult.success) {
                addResult(`✅ User enrolled with ID: ${enrollResult.enrollmentId}`, 'success');

                // 5. Test course access
                addResult('🔐 Testing course access...', 'info');
                const accessResult = await checkCourseAccess(user.uid, 'FAAI');
                if (accessResult.hasAccess) {
                    addResult('✅ Course access verified successfully!', 'success');
                } else {
                    addResult('❌ Course access check failed', 'error');
                }
            } else {
                addResult(`❌ Enrollment test failed: ${enrollResult.error}`, 'error');
            }

            // 6. Test role_audit_log collection (if role was assigned)
            addResult('📝 Testing role_audit_log collection...', 'info');
            const auditQuery = await getDocs(collection(db, 'role_audit_log'));
            addResult(`✅ Found ${auditQuery.size} role audit log entries`, 'success');

            // 7. Test general test_collection
            addResult('🧪 Testing general test_collection...', 'info');
            const testData = {
                userId: user.uid,
                userEmail: user.email,
                testMessage: 'Comprehensive test completed!',
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString(),
                allCollectionsTested: true
            };

            const docRef = await addDoc(collection(db, 'test_collection'), testData);
            addResult(`✅ Test document written with ID: ${docRef.id}`, 'success');

            addResult('🎉 All collections tested successfully!', 'success');

        } catch (error) {
            addResult(`❌ Comprehensive test failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Test 6: View all collections status
    const viewAllCollections = async () => {
        addResult('📊 Checking all collection statuses...', 'info');
        setLoading(true);

        try {
            const collections = [
                'users',
                'user_roles',
                'payments',
                'enrollments',
                'role_audit_log',
                'test_collection'
            ];

            for (const collectionName of collections) {
                try {
                    const querySnapshot = await getDocs(collection(db, collectionName));
                    addResult(`📁 ${collectionName}: ${querySnapshot.size} documents`, 'info');

                    if (querySnapshot.size > 0) {
                        const sampleDoc = querySnapshot.docs[0].data();
                        const sampleKeys = Object.keys(sampleDoc).slice(0, 3).join(', ');
                        addResult(`   Sample fields: ${sampleKeys}...`, 'info');
                    }
                } catch (error) {
                    addResult(`❌ ${collectionName}: ${error.message}`, 'error');
                }
            }

        } catch (error) {
            addResult(`❌ Collection status check failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Test 7: Cleanup all test data
    const cleanupAllTestData = async () => {
        addResult('🧹 Cleaning up ALL test data...', 'info');
        setLoading(true);

        try {
            const collections = [
                'test_collection',
                'role_audit_log' // Only cleanup test-specific data
            ];

            let totalDeleted = 0;

            for (const collectionName of collections) {
                try {
                    const querySnapshot = await getDocs(collection(db, collectionName));
                    const deletePromises = querySnapshot.docs.map(document =>
                        deleteDoc(doc(db, collectionName, document.id))
                    );

                    await Promise.all(deletePromises);
                    totalDeleted += deletePromises.length;
                    addResult(`✅ Cleaned ${deletePromises.length} documents from ${collectionName}`, 'success');
                } catch (error) {
                    addResult(`❌ Cleanup failed for ${collectionName}: ${error.message}`, 'error');
                }
            }

            addResult(`✅ Total cleanup: ${totalDeleted} documents deleted`, 'success');
            addResult('⚠️ Note: User profiles, roles, payments, and enrollments preserved', 'info');

        } catch (error) {
            addResult(`❌ Cleanup failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
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
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🔗 Test Connection
                </button>

                <button
                    onClick={testWrite}
                    disabled={loading || !user}
                    style={{
                        marginRight: '10px',
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ✍️ Test Write
                </button>

                <button
                    onClick={testRead}
                    disabled={loading}
                    style={{
                        marginRight: '10px',
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    📖 Test Read
                </button>

                <button
                    onClick={testUserManagement}
                    disabled={loading || !user}
                    style={{
                        marginRight: '10px',
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    👤 Test User Mgmt
                </button>

                <button
                    onClick={testAllCollections}
                    disabled={loading || !user}
                    style={{
                        marginRight: '10px',
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#14b8a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🧪 Test All Collections
                </button>

                <button
                    onClick={viewAllCollections}
                    disabled={loading}
                    style={{
                        marginRight: '10px',
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#0891b2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    📊 View Collections
                </button>

                <button
                    onClick={cleanupAllTestData}
                    disabled={loading}
                    style={{
                        marginRight: '10px',
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🧹 Cleanup Test Data
                </button>

                <button
                    onClick={clearResults}
                    style={{
                        marginBottom: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🗑️ Clear Results
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
