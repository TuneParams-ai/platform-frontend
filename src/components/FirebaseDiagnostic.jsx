import React, { useState, useEffect } from 'react';
import { db, auth, isFirebaseConfigured } from '../config/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

const FirebaseDiagnostic = () => {
    const [diagnostics, setDiagnostics] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    const addDiagnostic = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setDiagnostics(prev => [...prev, { timestamp, message, type }]);
        console.log(`[${timestamp}] ${message}`);
    };

    useEffect(() => {
        const runDiagnostics = async () => {
            addDiagnostic('🔧 Starting Firebase Diagnostics...', 'info');

            // Check basic configuration
            addDiagnostic(`Firebase configured: ${isFirebaseConfigured}`, isFirebaseConfigured ? 'success' : 'error');
            addDiagnostic(`Database object exists: ${!!db}`, db ? 'success' : 'error');
            addDiagnostic(`Auth object exists: ${!!auth}`, auth ? 'success' : 'error');

            if (auth) {
                addDiagnostic(`Current user: ${auth.currentUser ? auth.currentUser.email : 'Not authenticated'}`, 'info');
            }

            // Check environment variables
            const firebaseVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_FIREBASE'));
            addDiagnostic(`Firebase env vars found: ${firebaseVars.length}`, firebaseVars.length > 0 ? 'success' : 'warning');

            if (firebaseVars.length > 0) {
                firebaseVars.forEach(varName => {
                    const value = process.env[varName];
                    addDiagnostic(`${varName}: ${value ? 'Set' : 'Missing'}`, value ? 'success' : 'error');
                });
            }

            // Test Firestore connection
            if (db) {
                try {
                    addDiagnostic('🔍 Testing Firestore connection...', 'info');

                    // Try to read a small collection first
                    const testCollection = collection(db, 'course_reviews');
                    addDiagnostic('✅ Collection reference created', 'success');

                    const testQuery = query(testCollection, limit(1));
                    addDiagnostic('✅ Query object created', 'success');

                    const snapshot = await getDocs(testQuery);
                    addDiagnostic(`✅ Query executed successfully! Found ${snapshot.docs.length} documents`, 'success');

                    if (snapshot.docs.length > 0) {
                        const doc = snapshot.docs[0];
                        addDiagnostic(`📄 Sample document ID: ${doc.id}`, 'info');
                        addDiagnostic(`📄 Sample document fields: ${Object.keys(doc.data()).join(', ')}`, 'info');
                    } else {
                        addDiagnostic('📄 No documents found in course_reviews collection', 'warning');
                    }

                } catch (error) {
                    addDiagnostic(`❌ Firestore test failed: ${error.code} - ${error.message}`, 'error');

                    // Check for specific error codes
                    if (error.code === 'permission-denied') {
                        addDiagnostic('🔒 Permission denied - checking Firestore rules...', 'warning');
                        addDiagnostic('💡 Rules should allow: allow read: if true;', 'info');
                    } else if (error.code === 'unavailable') {
                        addDiagnostic('🌐 Service unavailable - check internet connection', 'warning');
                    } else if (error.code === 'unauthenticated') {
                        addDiagnostic('🔑 Unauthenticated - but reads should be public', 'warning');
                    }
                }
            } else {
                addDiagnostic('❌ Database object is null - check Firebase configuration', 'error');
            }
        };

        runDiagnostics();
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    padding: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    zIndex: 9999
                }}
            >
                🔧 Show Diagnostics
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '400px',
            maxHeight: '500px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '11px',
            zIndex: 9999,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>🔧 Firebase Diagnostics</h4>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {diagnostics.map((diag, index) => (
                    <div
                        key={index}
                        style={{
                            color: diag.type === 'error' ? '#dc3545' :
                                diag.type === 'success' ? '#28a745' :
                                    diag.type === 'warning' ? '#ffc107' : '#007bff',
                            margin: '2px 0',
                            padding: '2px 0'
                        }}
                    >
                        [{diag.timestamp}] {diag.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FirebaseDiagnostic;
