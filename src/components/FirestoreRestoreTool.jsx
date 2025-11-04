import React, { useState } from 'react';
import {
    collection,
    doc,
    writeBatch,
    getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FirestoreRestoreTool = () => {
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [backupData, setBackupData] = useState(null);
    const [selectedCollections, setSelectedCollections] = useState([]);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
        console.log(`[${timestamp}] ${message}`);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        addLog(`📁 Selected backup file: ${file.name}`, 'info');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                setBackupData(data);
                addLog(`✅ Backup file loaded successfully`, 'success');
                addLog(`📊 Backup created: ${new Date(data.timestamp).toLocaleString()}`, 'info');
                addLog(`📋 Version: ${data.version || '1.0'}`, 'info');
                addLog(`📋 Collections available: ${Object.keys(data.collections).join(', ')}`, 'info');

                // Check for subcollections (version 3.0+)
                if (data.subcollections && Object.keys(data.subcollections).length > 0) {
                    addLog(`🗂️ Subcollections found: ${Object.keys(data.subcollections).join(', ')}`, 'info');
                }

                // Auto-select all collections by default
                const allAvailableCollections = Object.keys(data.collections);
                if (data.subcollections) {
                    allAvailableCollections.push(...Object.keys(data.subcollections));
                }
                setSelectedCollections(allAvailableCollections);

            } catch (error) {
                addLog(`❌ Error parsing backup file: ${error.message}`, 'error');
                setBackupData(null);
            }
        };
        reader.readAsText(file);
    };

    const handleCollectionToggle = (collectionName) => {
        setSelectedCollections(prev =>
            prev.includes(collectionName)
                ? prev.filter(name => name !== collectionName)
                : [...prev, collectionName]
        );
    };

    const restoreFirestoreTimestamp = (timestampData) => {
        if (timestampData && timestampData.type === 'firestore/timestamp/1.0') {
            return new Date(timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000);
        }
        return timestampData;
    };

    const processDocumentData = (data) => {
        const processed = {};
        for (const [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object' && value.type === 'firestore/timestamp/1.0') {
                processed[key] = restoreFirestoreTimestamp(value);
            } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                processed[key] = processDocumentData(value);
            } else {
                processed[key] = value;
            }
        }
        return processed;
    };

    const restoreCollection = async (collectionName, documents, mode = 'replace') => {
        addLog(`🔄 Restoring collection: ${collectionName} (${documents.length} documents)`, 'info');

        try {
            // If mode is 'replace', clear existing data first
            if (mode === 'replace') {
                addLog(`🗑️ Clearing existing ${collectionName} collection...`, 'info');
                const existingSnapshot = await getDocs(collection(db, collectionName));

                if (!existingSnapshot.empty) {
                    // Delete in batches
                    const batchSize = 400;
                    const existingDocs = existingSnapshot.docs;

                    for (let i = 0; i < existingDocs.length; i += batchSize) {
                        const batchDocs = existingDocs.slice(i, i + batchSize);
                        const deleteBatch = writeBatch(db);

                        batchDocs.forEach(docSnap => {
                            deleteBatch.delete(docSnap.ref);
                        });

                        await deleteBatch.commit();
                        addLog(`  🗑️ Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(existingDocs.length / batchSize)}`, 'info');
                    }

                    addLog(`✅ Cleared ${existingDocs.length} existing documents`, 'success');
                }
            }

            // Restore documents in batches
            const batchSize = 400; // Conservative batch size for Firestore

            for (let i = 0; i < documents.length; i += batchSize) {
                const batchDocs = documents.slice(i, i + batchSize);
                const restoreBatch = writeBatch(db);

                batchDocs.forEach(docData => {
                    const docRef = doc(db, collectionName, docData.id);
                    const processedData = processDocumentData(docData.data);
                    restoreBatch.set(docRef, processedData);
                });

                await restoreBatch.commit();
                addLog(`  ✅ Restored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`, 'success');
            }

            addLog(`🎉 Successfully restored ${documents.length} documents to ${collectionName}`, 'success');

        } catch (error) {
            addLog(`❌ Error restoring ${collectionName}: ${error.message}`, 'error');
            throw error;
        }
    };

    const restoreSubcollection = async (subcollectionPath, documents, mode = 'replace') => {
        addLog(`🔄 Restoring subcollection: ${subcollectionPath}`, 'info');

        try {
            // Parse the subcollection path (e.g., "courses/FAAI/batches")
            const pathParts = subcollectionPath.split('/');
            if (pathParts.length !== 3) {
                throw new Error(`Invalid subcollection path: ${subcollectionPath}`);
            }

            const [parentCollection, parentDocId, subcollectionName] = pathParts;
            const parentDocRef = doc(db, parentCollection, parentDocId);
            const subcollectionRef = collection(parentDocRef, subcollectionName);

            // Clear existing documents if in replace mode
            if (mode === 'replace') {
                addLog(`  🗑️ Clearing existing documents in ${subcollectionPath}...`, 'info');
                const existingSnapshot = await getDocs(subcollectionRef);
                const existingDocs = existingSnapshot.docs;

                if (existingDocs.length > 0) {
                    const batchSize = 400;
                    for (let i = 0; i < existingDocs.length; i += batchSize) {
                        const batchDocs = existingDocs.slice(i, i + batchSize);
                        const deleteBatch = writeBatch(db);

                        batchDocs.forEach(docSnap => {
                            deleteBatch.delete(docSnap.ref);
                        });

                        await deleteBatch.commit();
                        addLog(`  🗑️ Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(existingDocs.length / batchSize)}`, 'info');
                    }

                    addLog(`✅ Cleared ${existingDocs.length} existing documents`, 'success');
                }
            }

            // Restore documents in batches
            const batchSize = 400;

            for (let i = 0; i < documents.length; i += batchSize) {
                const batchDocs = documents.slice(i, i + batchSize);
                const restoreBatch = writeBatch(db);

                batchDocs.forEach(docData => {
                    const docRef = doc(parentDocRef, subcollectionName, docData.id);
                    const processedData = processDocumentData(docData.data);
                    restoreBatch.set(docRef, processedData);
                });

                await restoreBatch.commit();
                addLog(`  ✅ Restored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`, 'success');
            }

            addLog(`🎉 Successfully restored ${documents.length} documents to ${subcollectionPath}`, 'success');

        } catch (error) {
            addLog(`❌ Error restoring ${subcollectionPath}: ${error.message}`, 'error');
            throw error;
        }
    };

    const performRestore = async (mode = 'replace') => {
        if (!backupData) {
            addLog('❌ No backup data loaded', 'error');
            return;
        }

        if (selectedCollections.length === 0) {
            addLog('❌ No collections selected for restore', 'error');
            return;
        }

        const confirmed = window.confirm(
            `🚨 DANGER! This will ${mode === 'replace' ? 'REPLACE' : 'ADD TO'} the following collections:\n\n` +
            selectedCollections.join(', ') + '\n\n' +
            'Are you absolutely sure you want to proceed?\n\n' +
            'This action cannot be easily undone!'
        );

        if (!confirmed) {
            addLog('❌ Restore cancelled by user', 'warning');
            return;
        }

        setIsRunning(true);
        addLog(`🚨 Starting ${mode} restore operation...`, 'info');
        addLog(`📊 Restoring ${selectedCollections.length} collections`, 'info');

        try {
            let totalRestored = 0;

            for (const collectionName of selectedCollections) {
                // Check if this is a regular collection
                if (backupData.collections && backupData.collections[collectionName]) {
                    const documents = backupData.collections[collectionName];
                    if (documents && documents.length > 0) {
                        await restoreCollection(collectionName, documents, mode);
                        totalRestored += documents.length;
                    } else {
                        addLog(`⚠️ No documents found for collection: ${collectionName}`, 'warning');
                    }
                }
                // Check if this is a subcollection
                else if (backupData.subcollections && backupData.subcollections[collectionName]) {
                    const documents = backupData.subcollections[collectionName];
                    if (documents && documents.length > 0) {
                        await restoreSubcollection(collectionName, documents, mode);
                        totalRestored += documents.length;
                    } else {
                        addLog(`⚠️ No documents found for subcollection: ${collectionName}`, 'warning');
                    }
                } else {
                    addLog(`⚠️ Collection/subcollection not found in backup: ${collectionName}`, 'warning');
                }
            }

            addLog(`🎉 RESTORE COMPLETED! Total documents restored: ${totalRestored}`, 'success');

        } catch (error) {
            addLog(`❌ CRITICAL ERROR during restore: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="firestore-restore-tool" style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
            <div className="header" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2>🔄 Firestore Restore Tool</h2>
                <p>Restore data from backup files</p>
                <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                    <strong>⚠️ DANGER:</strong> This tool can overwrite your entire database.
                    Use with extreme caution and only on backup/test environments first!
                </div>
            </div>

            <div className="file-upload" style={{ marginBottom: '20px' }}>
                <div style={{ padding: '15px', border: '2px dashed #ccc', borderRadius: '5px', textAlign: 'center' }}>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        style={{ marginBottom: '10px' }}
                    />
                    <p>Select a backup JSON file to restore from</p>
                </div>
            </div>

            {backupData && (
                <div className="backup-info" style={{
                    background: '#e7f3ff',
                    border: '1px solid #b8daff',
                    borderRadius: '5px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <h4>📋 Backup Information</h4>
                    <p><strong>Created:</strong> {new Date(backupData.timestamp).toLocaleString()}</p>
                    <p><strong>Description:</strong> {backupData.description}</p>
                    <p><strong>Version:</strong> {backupData.version}</p>

                    <div style={{ marginTop: '15px' }}>
                        <strong>📁 Select Collections to Restore:</strong>
                        <div style={{ marginTop: '10px' }}>
                            {/* Regular Collections */}
                            <div style={{ marginBottom: '15px' }}>
                                <h5 style={{ margin: '10px 0 5px 0', color: '#495057' }}>📦 Top-level Collections:</h5>
                                {Object.entries(backupData.collections).map(([name, docs]) => (
                                    <label key={name} style={{ display: 'block', margin: '5px 0' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCollections.includes(name)}
                                            onChange={() => handleCollectionToggle(name)}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <strong>{name}</strong> ({docs.length} documents)
                                    </label>
                                ))}
                            </div>

                            {/* Subcollections */}
                            {backupData.subcollections && Object.keys(backupData.subcollections).length > 0 && (
                                <div>
                                    <h5 style={{ margin: '10px 0 5px 0', color: '#495057' }}>🗂️ Course-specific Subcollections:</h5>
                                    {Object.entries(backupData.subcollections).map(([path, docs]) => (
                                        <label key={path} style={{ display: 'block', margin: '5px 0' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCollections.includes(path)}
                                                onChange={() => handleCollectionToggle(path)}
                                                style={{ marginRight: '10px' }}
                                            />
                                            <strong>{path}</strong> ({docs.length} documents)
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => performRestore('replace')}
                    disabled={isRunning || !backupData || selectedCollections.length === 0}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (isRunning || !backupData) ? 'not-allowed' : 'pointer',
                        opacity: (isRunning || !backupData) ? 0.6 : 1,
                        fontSize: '16px'
                    }}
                >
                    🚨 REPLACE Database
                </button>

                <button
                    onClick={() => performRestore('merge')}
                    disabled={isRunning || !backupData || selectedCollections.length === 0}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: (isRunning || !backupData) ? 'not-allowed' : 'pointer',
                        opacity: (isRunning || !backupData) ? 0.6 : 1,
                        fontSize: '16px'
                    }}
                >
                    ➕ MERGE with Database
                </button>

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
                <div style={{ padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px', marginBottom: '20px' }}>
                    ⏳ Restore in progress... This may take several minutes for large datasets.
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
                    📋 Restore Logs ({logs.length} entries)
                </div>
                {logs.length === 0 ? (
                    <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        No logs yet. Upload a backup file to start.
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
                <h4>📖 Restore Instructions:</h4>
                <ol>
                    <li><strong>Upload Backup:</strong> Select your backup JSON file</li>
                    <li><strong>Select Collections:</strong> Choose which collections to restore</li>
                    <li><strong>Choose Mode:</strong>
                        <ul>
                            <li><strong>REPLACE:</strong> Deletes existing data and replaces with backup</li>
                            <li><strong>MERGE:</strong> Adds backup data to existing data (may create duplicates)</li>
                        </ul>
                    </li>
                    <li><strong>Confirm:</strong> Multiple confirmation prompts will appear</li>
                    <li><strong>Monitor:</strong> Watch the logs for progress and any errors</li>
                </ol>

                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '3px' }}>
                    <strong>🚨 WARNING:</strong> Always test restore operations on a development/staging environment first!
                </div>
            </div>
        </div>
    );
};

export default FirestoreRestoreTool;