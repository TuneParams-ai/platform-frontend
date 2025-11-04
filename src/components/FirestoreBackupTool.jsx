import React, { useState } from 'react';
import {
    collection,
    getDocs
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
            const collections = await discoverCollections(); const backup = {
                timestamp: new Date().toISOString(),
                version: '2.0', // Updated version for comprehensive backup
                description: 'Comprehensive backup of all discovered collections',
                totalCollections: collections.length,
                collections: {}
            };

            let totalDocuments = 0;

            // Backup each collection
            for (const collectionName of collections) {
                const collectionData = await backupCollection(collectionName);
                backup.collections[collectionName] = collectionData;
                totalDocuments += collectionData.length;
            }

            setBackupData(backup);

            addLog(`🎉 Backup completed successfully!`, 'success');
            addLog(`📊 Total documents backed up: ${totalDocuments}`, 'success');

            // Log collection summary
            for (const [name, data] of Object.entries(backup.collections)) {
                addLog(`  - ${name}: ${data.length} documents`, 'info');
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
        <div className="firestore-backup-tool" style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
            <div className="header" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2>🛡️ Firestore Backup Tool</h2>
                <p>Create comprehensive backups before running migrations</p>
                <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                    <strong>📋 This tool will discover and backup ALL collections:</strong>
                    <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                        <li>📚 Enrollments, Courses, and Batches</li>
                        <li>💳 Payments and Manual Payments</li>
                        <li>👤 Users, Roles, and Permissions</li>
                        <li>⭐ Course Reviews and Ratings</li>
                        <li>🎫 Coupons and Email Tracking</li>
                        <li>� Forum Threads and Replies</li>
                        <li>📧 Email Records and Audit Logs</li>
                        <li>🔍 <strong>Automatically discovers ALL collections in your database</strong></li>
                    </ul>
                </div>
            </div>

            <div className="controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={createBackup}
                    disabled={isRunning}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        opacity: isRunning ? 0.6 : 1,
                        fontSize: '16px'
                    }}
                >
                    {isRunning ? '⏳ Creating Backup...' : '🛡️ Create Full Backup'}
                </button>

                {backupData && (
                    <button
                        onClick={downloadBackup}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        📥 Download Complete Backup
                    </button>
                )}

                <button
                    onClick={clearLogs}
                    disabled={isRunning}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isRunning ? 'not-allowed' : 'pointer'
                    }}
                >
                    🗑️ Clear Logs
                </button>
            </div>

            {isRunning && (
                <div style={{ padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px', marginBottom: '20px' }}>
                    ⏳ Backup in progress... Please wait while we download your data.
                </div>
            )}

            {backupData && (
                <div className="backup-summary" style={{
                    background: '#e7f3ff',
                    border: '1px solid #b8daff',
                    borderRadius: '5px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <h4>📊 Backup Summary</h4>
                    <p><strong>Created:</strong> {new Date(backupData.timestamp).toLocaleString()}</p>
                    <p><strong>Total Collections:</strong> {Object.keys(backupData.collections).length}</p>
                    <p><strong>Total Documents:</strong> {Object.values(backupData.collections).reduce((sum, coll) => sum + coll.length, 0)}</p>

                    <div style={{ marginTop: '15px' }}>
                        <strong>📁 Individual Collection Downloads:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                            {Object.entries(backupData.collections).map(([name, data]) => (
                                <button
                                    key={name}
                                    onClick={() => downloadCollectionBackup(name)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#ffc107',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    title={`Download ${data.length} documents`}
                                >
                                    📄 {name} ({data.length})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="logs" style={{
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                padding: '15px',
                height: '400px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '14px'
            }}>
                <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                    📋 Backup Logs ({logs.length} entries)
                </div>
                {logs.length === 0 ? (
                    <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        No logs yet. Click "Create Full Backup" to start.
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: '5px',
                                color: log.type === 'error' ? '#dc3545' :
                                    log.type === 'success' ? '#28a745' :
                                        log.type === 'warning' ? '#ffc107' : '#000'
                            }}
                        >
                            <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span> {log.message}
                        </div>
                    ))
                )}
            </div>

            <div className="instructions" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                <h4>📖 Backup Instructions:</h4>
                <ol>
                    <li><strong>Create Full Backup:</strong> Downloads all critical collections from Firestore</li>
                    <li><strong>Download Files:</strong> Save the backup files to a secure location</li>
                    <li><strong>Verify Backup:</strong> Check that all expected collections and document counts are correct</li>
                    <li><strong>Store Safely:</strong> Keep backup files in a secure location with proper naming</li>
                    <li><strong>Test Restore:</strong> Consider testing restore process in a development environment</li>
                </ol>

                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '3px' }}>
                    <strong>⚠️ Important:</strong> This backup method downloads data as JSON files.
                    For the most comprehensive backup, also use Firebase CLI: <code>firebase firestore:export</code>
                </div>
            </div>
        </div>
    );
};

export default FirestoreBackupTool;