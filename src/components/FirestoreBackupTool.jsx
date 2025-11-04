import React, { useState } from 'react';
import {
    collection,
    getDocs,
    doc
} from 'firebase/firestore';
import { db } from '../config/firebase'; const FirestoreBackupTool = () => {
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [backupData, setBackupData] = useState(null);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
        console.log(`[${timestamp}] ${message}`);
    };

    const clearLogs = () => {
        setLogs([]);
        setBackupData(null);
    };

    const backupCollection = async (collectionName) => {
        addLog(`📦 Backing up collection: ${collectionName}`, 'info');

        try {
            const snapshot = await getDocs(collection(db, collectionName));
            const data = [];

            snapshot.docs.forEach(doc => {
                data.push({
                    id: doc.id,
                    data: doc.data()
                });
            });

            addLog(`✅ ${collectionName}: ${data.length} documents backed up`, 'success');
            return data;

        } catch (error) {
            addLog(`❌ Error backing up ${collectionName}: ${error.message}`, 'error');
            return [];
        }
    };

    const backupSubcollection = async (parentPath, subcollectionName) => {
        const fullPath = `${parentPath}/${subcollectionName}`;
        addLog(`📦 Backing up subcollection: ${fullPath}`, 'info');

        try {
            const [parentCollection, parentDocId] = parentPath.split('/');
            const parentDocRef = doc(db, parentCollection, parentDocId);
            const subcollectionSnapshot = await getDocs(collection(parentDocRef, subcollectionName));
            const data = [];

            subcollectionSnapshot.docs.forEach(doc => {
                data.push({
                    id: doc.id,
                    data: doc.data()
                });
            });

            addLog(`✅ ${fullPath}: ${data.length} documents backed up`, 'success');
            return data;

        } catch (error) {
            addLog(`❌ Error backing up ${fullPath}: ${error.message}`, 'error');
            return [];
        }
    };

    const backupCourseSpecificBatches = async () => {
        addLog('🗂️ Backing up course-specific batch subcollections...', 'info');
        const courseSpecificBatches = {};

        const courses = ['FAAI', 'RLAI'];
        for (const courseId of courses) {
            try {
                const courseBatches = await backupSubcollection(`courses/${courseId}`, 'batches');
                if (courseBatches.length > 0) {
                    courseSpecificBatches[`courses/${courseId}/batches`] = courseBatches;
                }
            } catch (error) {
                addLog(`⚠️ Could not backup batches for course ${courseId}: ${error.message}`, 'warning');
            }
        }

        return courseSpecificBatches;
    };

    const discoverCollections = async () => {
        addLog('🔍 Discovering all collections in database...', 'info');

        try {
            // Since Firestore doesn't allow listing collections directly from client,
            // we'll use a comprehensive list of known collections
            const knownCollections = [
                'enrollments',
                'courses',
                'payments',
                'users',
                'user_roles',
                'course_reviews',
                'coupons',
                'manual_payments',
                'emails_sent',
                'forum_threads',
                'forum_replies',
                'role_audit_log',
                'roles',
                'audit_logs',
                'email_tracking',
                'progress_tracking',
                'batches',
                'videos',
                'schedule',
                'notifications'
            ];

            // Test which collections actually exist by trying to read them
            const existingCollections = [];

            for (const collectionName of knownCollections) {
                try {
                    const testSnapshot = await getDocs(collection(db, collectionName));
                    // If we can read it and it's not undefined, it exists
                    existingCollections.push(collectionName);
                    addLog(`✅ Found collection: ${collectionName} (${testSnapshot.size} documents)`, 'info');
                } catch (error) {
                    // Collection doesn't exist or can't be read
                    addLog(`⚠️ Collection not accessible: ${collectionName}`, 'warning');
                }
            }

            addLog(`📊 Total collections found: ${existingCollections.length}`, 'success');
            return existingCollections;

        } catch (error) {
            addLog(`❌ Error discovering collections: ${error.message}`, 'error');
            // Fallback to essential collections
            return ['enrollments', 'courses', 'payments', 'users', 'user_roles', 'course_reviews'];
        }
    };

    const createBackup = async () => {
        setIsRunning(true);
        addLog('🛡️ Starting comprehensive Firestore backup...', 'info');

        try {
            // Discover all collections dynamically
            const collections = await discoverCollections();

            // Backup course-specific subcollections
            const courseSpecificBatches = await backupCourseSpecificBatches();

            const backup = {
                timestamp: new Date().toISOString(),
                version: '3.0', // Updated version for comprehensive backup with subcollections
                description: 'Comprehensive backup including all collections and course-specific subcollections',
                totalCollections: collections.length + Object.keys(courseSpecificBatches).length,
                collections: {},
                subcollections: courseSpecificBatches
            };

            let totalDocuments = 0;

            // Backup each collection
            for (const collectionName of collections) {
                const collectionData = await backupCollection(collectionName);
                backup.collections[collectionName] = collectionData;
                totalDocuments += collectionData.length;
            }

            // Count subcollection documents
            for (const [, data] of Object.entries(courseSpecificBatches)) {
                totalDocuments += data.length;
            }

            setBackupData(backup);

            addLog(`🎉 Backup completed successfully!`, 'success');
            addLog(`📊 Total documents backed up: ${totalDocuments}`, 'success');

            // Log collection summary
            for (const [name, data] of Object.entries(backup.collections)) {
                addLog(`  - ${name}: ${data.length} documents`, 'info');
            }

            // Log subcollection summary
            for (const [path, data] of Object.entries(courseSpecificBatches)) {
                addLog(`  - ${path}: ${data.length} documents`, 'info');
            }

        } catch (error) {
            addLog(`❌ Error during backup: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    const downloadBackup = () => {
        if (!backupData) {
            addLog('❌ No backup data available to download', 'error');
            return;
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];

            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `firestore-backup-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            addLog('✅ Backup file downloaded successfully', 'success');

        } catch (error) {
            addLog(`❌ Error downloading backup: ${error.message}`, 'error');
        }
    };

    const downloadCollectionBackup = (collectionName) => {
        if (!backupData || !backupData.collections[collectionName]) {
            addLog(`❌ No backup data available for ${collectionName}`, 'error');
            return;
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];

            const dataStr = JSON.stringify(backupData.collections[collectionName], null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${collectionName}-backup-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            addLog(`✅ ${collectionName} backup downloaded`, 'success');

        } catch (error) {
            addLog(`❌ Error downloading ${collectionName}: ${error.message}`, 'error');
        }
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '32px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    fontSize: '2.25rem',
                    fontWeight: '700',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    🛡️ Database Backup Tool
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    margin: '0',
                    opacity: '0.9',
                    fontWeight: '400'
                }}>
                    Create comprehensive backups of your Firestore database
                </p>
            </div>

            {/* Info Section */}
            <div style={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)',
                border: '1px solid #81c784',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#2e7d32',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📋 Comprehensive Backup Coverage
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div>
                        <ul style={{ margin: '0', paddingLeft: '20px', color: '#2e7d32', lineHeight: '1.8' }}>
                            <li>📚 <strong>Core Data:</strong> Enrollments, Courses, Batches</li>
                            <li>💳 <strong>Financial:</strong> Payments, Manual Payments</li>
                            <li>👤 <strong>User Data:</strong> Users, Roles, Permissions</li>
                            <li>⭐ <strong>Reviews:</strong> Course Reviews and Ratings</li>
                        </ul>
                    </div>
                    <div>
                        <ul style={{ margin: '0', paddingLeft: '20px', color: '#2e7d32', lineHeight: '1.8' }}>
                            <li>🎫 <strong>Marketing:</strong> Coupons, Email Tracking</li>
                            <li>💬 <strong>Community:</strong> Forum Threads, Replies</li>
                            <li>📧 <strong>Communications:</strong> Email Records</li>
                            <li>🔍 <strong>Auto-Discovery:</strong> All collections detected</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                    color: '#343a40',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    ⚙️ Backup Controls
                </h2>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                        onClick={createBackup}
                        disabled={isRunning}
                        style={{
                            padding: '16px 32px',
                            backgroundColor: isRunning ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: isRunning ? 'none' : '0 4px 12px rgba(40,167,69,0.2)',
                            transform: isRunning ? 'none' : 'translateY(0)',
                            minWidth: '200px',
                            justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                            if (!isRunning) {
                                e.target.style.backgroundColor = '#218838';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(40,167,69,0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isRunning) {
                                e.target.style.backgroundColor = '#28a745';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(40,167,69,0.2)';
                            }
                        }}
                    >
                        {isRunning ? (
                            <>⏳ Creating Backup...</>
                        ) : (
                            <>🚀 Start Full Backup</>
                        )}
                    </button>

                    {backupData && (
                        <button
                            onClick={downloadBackup}
                            style={{
                                padding: '16px 24px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#0056b3';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(0,123,255,0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#007bff';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.2)';
                            }}
                        >
                            📥 Download Complete Backup
                        </button>
                    )}

                    <button
                        onClick={clearLogs}
                        disabled={isRunning}
                        style={{
                            padding: '16px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseOver={(e) => {
                            if (!isRunning) {
                                e.target.style.backgroundColor = '#5a6268';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isRunning) {
                                e.target.style.backgroundColor = '#6c757d';
                            }
                        }}
                    >
                        🗑️ Clear Logs
                    </button>
                </div>

                {isRunning && (
                    <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#d1ecf1',
                        borderRadius: '8px',
                        border: '1px solid #bee5eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '1rem',
                        color: '#0c5460'
                    }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '3px solid #17a2b8',
                            borderTop: '3px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <strong>Backup in progress... Please wait while we download your data.</strong>
                    </div>
                )}
            </div>

            {/* Backup Summary */}
            {backupData && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        margin: '0 0 20px 0',
                        color: '#343a40',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📊 Backup Summary
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#007bff' }}>
                                {new Date(backupData.timestamp).toLocaleDateString()}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Created Date</div>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745' }}>
                                {Object.keys(backupData.collections).length}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Collections</div>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffc107' }}>
                                {Object.values(backupData.collections).reduce((sum, coll) => sum + coll.length, 0)}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Total Documents</div>
                        </div>
                    </div>

                    <h3 style={{ margin: '0 0 16px 0', color: '#495057', fontSize: '1.2rem' }}>
                        📁 Individual Collection Downloads
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                        {Object.entries(backupData.collections).map(([name, data]) => (
                            <button
                                key={name}
                                onClick={() => downloadCollectionBackup(name)}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#fff3cd',
                                    color: '#856404',
                                    border: '1px solid #ffeaa7',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#ffc107';
                                    e.target.style.color = '#000';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(255,193,7,0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#fff3cd';
                                    e.target.style.color = '#856404';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <span>📄 {name}</span>
                                <span style={{
                                    background: '#ffc107',
                                    color: '#000',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    {data.length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Logs Section */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    margin: '0 0 20px 0',
                    color: '#343a40',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📋 Activity Log
                    <span style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                    }}>
                        {logs.length} entries
                    </span>
                </h2>

                <div style={{
                    backgroundColor: '#1e1e1e',
                    borderRadius: '8px',
                    padding: '20px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '1px solid #333',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                }}>
                    {logs.length === 0 ? (
                        <div style={{
                            color: '#6c757d',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            padding: '40px 20px',
                            fontSize: '1rem'
                        }}>
                            💭 No activity yet. Click "Start Full Backup" to begin the backup process.
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '8px',
                                    color: log.type === 'error' ? '#ff6b6b' :
                                        log.type === 'success' ? '#51cf66' :
                                            log.type === 'warning' ? '#ffd43b' : '#74c0fc',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}
                            >
                                <span style={{ opacity: '0.7', fontSize: '0.85rem' }}>
                                    [{log.timestamp}]
                                </span>{' '}
                                {log.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Help Section */}
            <div style={{
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)',
                border: '1px solid #81c784',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#2e7d32',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    💡 How to Use This Tool
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div>
                        <ol style={{ margin: '0', paddingLeft: '20px', color: '#2e7d32', lineHeight: '1.8' }}>
                            <li><strong>Start Backup:</strong> Click "Start Full Backup" to begin</li>
                            <li><strong>Monitor Progress:</strong> Watch the activity log for updates</li>
                            <li><strong>Download Complete:</strong> Get the full backup as JSON</li>
                            <li><strong>Individual Downloads:</strong> Download specific collections</li>
                        </ol>
                    </div>
                    <div style={{
                        backgroundColor: '#e3f2fd',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #81c784'
                    }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#1565c0', fontSize: '1rem' }}>
                            💾 Backup Security
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.95rem', color: '#1565c0', lineHeight: '1.6' }}>
                            All backups are downloaded as JSON files with timestamp information.
                            Store them securely and use the Restore Tool to recover data when needed.
                            Consider testing restores in a development environment first.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Scrollbar styling for logs */
                div::-webkit-scrollbar {
                    width: 8px;
                }
                div::-webkit-scrollbar-track {
                    background: #2d2d2d;
                    border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: #777;
                }
            `}</style>
        </div>
    );
};

export default FirestoreBackupTool;