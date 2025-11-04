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
                background: 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)',
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
                    🔄 Database Restore Tool
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    margin: '0',
                    opacity: '0.9',
                    fontWeight: '400'
                }}>
                    Restore data from backup files with precision and safety
                </p>
            </div>

            {/* Critical Warning Section */}
            <div style={{
                background: 'linear-gradient(135deg, #fff3cd 0%, #f8d7da 100%)',
                border: '2px solid #dc3545',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(220,53,69,0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <span style={{ fontSize: '2rem', flexShrink: 0 }}>⚠️</span>
                    <div>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            color: '#721c24',
                            fontSize: '1.3rem',
                            fontWeight: '700'
                        }}>
                            CRITICAL WARNING - DATA REPLACEMENT OPERATION
                        </h3>
                        <div style={{ color: '#721c24', lineHeight: '1.7', fontSize: '1rem' }}>
                            <p style={{ margin: '0 0 12px 0', fontWeight: '600' }}>
                                This tool can <strong>completely overwrite</strong> your entire database.
                            </p>
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                                <li><strong>REPLACE mode:</strong> Deletes existing data and replaces with backup</li>
                                <li><strong>MERGE mode:</strong> Adds backup data alongside existing data</li>
                                <li><strong>Always test on development environments first!</strong></li>
                                <li><strong>Create a fresh backup before any restore operation</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Upload Section */}
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
                    📁 Select Backup File
                </h2>

                <div style={{
                    border: '3px dashed #6c757d',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: '0.6' }}>📄</div>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        style={{
                            padding: '12px',
                            fontSize: '1rem',
                            border: '2px solid #007bff',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            marginBottom: '12px'
                        }}
                    />
                    <p style={{
                        margin: '0',
                        color: '#6c757d',
                        fontSize: '1.1rem',
                        fontWeight: '500'
                    }}>
                        Select a backup JSON file to restore from
                    </p>
                </div>
            </div>

            {/* Backup Information Section */}
            {backupData && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid #28a745'
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
                        📋 Backup Information
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1976d2' }}>
                                {new Date(backupData.timestamp).toLocaleString()}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Created</div>
                        </div>
                        <div style={{ background: '#e8f5e8', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2e7d32' }}>
                                {backupData.version}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Version</div>
                        </div>
                        <div style={{ background: '#fff3cd', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#856404', wordBreak: 'break-word' }}>
                                {backupData.description || 'No description'}
                            </div>
                            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>Description</div>
                        </div>
                    </div>

                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        margin: '0 0 16px 0',
                        color: '#495057'
                    }}>
                        📦 Select Collections to Restore
                    </h3>

                    {/* Regular Collections */}
                    {Object.keys(backupData.collections).length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{
                                margin: '0 0 12px 0',
                                color: '#495057',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                📚 Top-level Collections
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                {Object.entries(backupData.collections).map(([name, docs]) => (
                                    <label key={name} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        border: '2px solid #e9ecef',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: selectedCollections.includes(name) ? '#e7f3ff' : 'white'
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.borderColor = '#007bff';
                                            e.currentTarget.style.backgroundColor = selectedCollections.includes(name) ? '#cce7ff' : '#f8f9fa';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.borderColor = selectedCollections.includes(name) ? '#007bff' : '#e9ecef';
                                            e.currentTarget.style.backgroundColor = selectedCollections.includes(name) ? '#e7f3ff' : 'white';
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCollections.includes(name)}
                                            onChange={() => handleCollectionToggle(name)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#343a40' }}>{name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                {docs.length} documents
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subcollections */}
                    {backupData.subcollections && Object.keys(backupData.subcollections).length > 0 && (
                        <div>
                            <h4 style={{
                                margin: '0 0 12px 0',
                                color: '#495057',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🗂️ Course-specific Subcollections
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                                {Object.entries(backupData.subcollections).map(([path, docs]) => (
                                    <label key={path} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        border: '2px solid #e9ecef',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: selectedCollections.includes(path) ? '#e8f5e8' : 'white'
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.borderColor = '#28a745';
                                            e.currentTarget.style.backgroundColor = selectedCollections.includes(path) ? '#d1ecf1' : '#f8f9fa';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.borderColor = selectedCollections.includes(path) ? '#28a745' : '#e9ecef';
                                            e.currentTarget.style.backgroundColor = selectedCollections.includes(path) ? '#e8f5e8' : 'white';
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCollections.includes(path)}
                                            onChange={() => handleCollectionToggle(path)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#343a40' }}>{path}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                {docs.length} documents
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
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
                        ⚡ Restore Actions
                    </h2>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => performRestore('replace')}
                            disabled={isRunning || !backupData || selectedCollections.length === 0}
                            style={{
                                padding: '16px 24px',
                                backgroundColor: (isRunning || !backupData || selectedCollections.length === 0) ? '#6c757d' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: (isRunning || !backupData || selectedCollections.length === 0) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: (isRunning || !backupData || selectedCollections.length === 0) ? 'none' : '0 4px 12px rgba(220,53,69,0.2)',
                                minWidth: '200px',
                                justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                                if (!isRunning && backupData && selectedCollections.length > 0) {
                                    e.target.style.backgroundColor = '#c82333';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(220,53,69,0.3)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isRunning && backupData && selectedCollections.length > 0) {
                                    e.target.style.backgroundColor = '#dc3545';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(220,53,69,0.2)';
                                }
                            }}
                        >
                            🚨 REPLACE Database
                        </button>

                        <button
                            onClick={() => performRestore('merge')}
                            disabled={isRunning || !backupData || selectedCollections.length === 0}
                            style={{
                                padding: '16px 24px',
                                backgroundColor: (isRunning || !backupData || selectedCollections.length === 0) ? '#6c757d' : '#ffc107',
                                color: (isRunning || !backupData || selectedCollections.length === 0) ? 'white' : '#000',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: (isRunning || !backupData || selectedCollections.length === 0) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: (isRunning || !backupData || selectedCollections.length === 0) ? 'none' : '0 4px 12px rgba(255,193,7,0.2)',
                                minWidth: '200px',
                                justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                                if (!isRunning && backupData && selectedCollections.length > 0) {
                                    e.target.style.backgroundColor = '#e0a800';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(255,193,7,0.3)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isRunning && backupData && selectedCollections.length > 0) {
                                    e.target.style.backgroundColor = '#ffc107';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(255,193,7,0.2)';
                                }
                            }}
                        >
                            ➕ MERGE with Database
                        </button>

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
                </div>
            )}

            {/* Activity Log */}
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
                            💭 No activity yet. Select a backup file and choose restore options to begin.
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
                                    [{new Date().toLocaleTimeString()}]
                                </span>{' '}
                                {log.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div style={{
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                border: '1px solid #ffc107',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#856404',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    💡 Step-by-Step Instructions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div>
                        <ol style={{ margin: '0', paddingLeft: '20px', color: '#856404', lineHeight: '1.8' }}>
                            <li><strong>Upload:</strong> Select a backup JSON file</li>
                            <li><strong>Review:</strong> Check backup information and version</li>
                            <li><strong>Select:</strong> Choose collections to restore</li>
                            <li><strong>Choose Mode:</strong> REPLACE (overwrites) or MERGE (adds)</li>
                            <li><strong>Confirm:</strong> Multiple confirmation prompts will appear</li>
                            <li><strong>Monitor:</strong> Watch the logs for progress and any errors</li>
                        </ol>
                    </div>
                    <div style={{
                        backgroundColor: '#f8d7da',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #f5c6cb'
                    }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#721c24', fontSize: '1rem' }}>
                            🚨 Safety Reminder
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.95rem', color: '#721c24', lineHeight: '1.6' }}>
                            <strong>Always test restore operations on a development/staging environment first!</strong>
                            Create a fresh backup before any restore operation. This action cannot be easily undone.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
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

export default FirestoreRestoreTool;