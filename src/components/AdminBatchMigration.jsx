import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { coursesData } from '../data/coursesData';

/**
 * Admin utility component to migrate batch data to Firestore
 * This should only be visible to admins
 */
const AdminBatchMigration = () => {
    const [migrating, setMigrating] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [logs, setLogs] = useState([]);
    const [verificationResults, setVerificationResults] = useState(null);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
    };

    const migrateBatches = async () => {
        setMigrating(true);
        setLogs([]);
        addLog('Starting batch migration...', 'info');

        try {
            for (const course of coursesData) {
                addLog(`Processing course: ${course.title} (${course.id})`, 'info');

                if (!course.batches || course.batches.length === 0) {
                    addLog(`No batches to migrate for ${course.id}`, 'warning');
                    continue;
                }

                // Check existing batches
                const batchesRef = collection(db, 'courses', course.id, 'batches');
                const existingBatches = await getDocs(batchesRef);

                addLog(`Found ${existingBatches.size} existing batches in Firestore`, 'info');
                addLog(`Found ${course.batches.length} batches in static data`, 'info');

                if (existingBatches.size > 0) {
                    addLog(`Batches already exist for ${course.id}. Skipping...`, 'warning');
                    continue;
                }

                // Migrate each batch
                for (const batch of course.batches) {
                    addLog(`Migrating Batch ${batch.batchNumber}: ${batch.batchName}`, 'info');

                    const batchDocRef = doc(collection(db, 'courses', course.id, 'batches'));

                    await setDoc(batchDocRef, {
                        batchNumber: batch.batchNumber,
                        batchName: batch.batchName,
                        startDate: batch.startDate,
                        endDate: batch.endDate,
                        status: batch.status,
                        maxCapacity: batch.maxCapacity,
                        enrollmentCount: batch.enrollmentCount || 0,
                        classLinks: batch.classLinks || { zoom: '', discord: '' },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });

                    addLog(`✓ Batch ${batch.batchNumber} migrated (ID: ${batchDocRef.id})`, 'success');

                    // Migrate videos
                    if (batch.videos && batch.videos.length > 0) {
                        for (let i = 0; i < batch.videos.length; i++) {
                            const video = batch.videos[i];
                            const videoDocRef = doc(collection(db, 'courses', course.id, 'batches', batchDocRef.id, 'videos'));
                            await setDoc(videoDocRef, {
                                title: video.title,
                                youtubeUrl: video.youtubeUrl,
                                thumbnail: video.thumbnail,
                                order: i,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                        addLog(`  ✓ Migrated ${batch.videos.length} videos`, 'success');
                    }

                    // Migrate schedule
                    if (batch.schedule && batch.schedule.length > 0) {
                        for (const scheduleEntry of batch.schedule) {
                            const scheduleDocRef = doc(collection(db, 'courses', course.id, 'batches', batchDocRef.id, 'schedule'));
                            await setDoc(scheduleDocRef, {
                                ...scheduleEntry,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }
                        addLog(`  ✓ Migrated ${batch.schedule.length} schedule entries`, 'success');
                    }
                }
            }

            addLog('Migration completed successfully!', 'success');

        } catch (error) {
            addLog(`Error: ${error.message}`, 'error');
            console.error('Migration error:', error);
        } finally {
            setMigrating(false);
        }
    };

    const verifyBatches = async () => {
        setVerifying(true);
        setVerificationResults(null);
        addLog('Starting verification...', 'info');

        try {
            const results = [];
            const coursesRef = collection(db, 'courses');
            const coursesSnapshot = await getDocs(coursesRef);

            for (const courseDoc of coursesSnapshot.docs) {
                const courseData = courseDoc.data();
                const batchesRef = collection(db, 'courses', courseDoc.id, 'batches');
                const batchesSnapshot = await getDocs(batchesRef);

                const batches = [];
                batchesSnapshot.forEach(batchDoc => {
                    batches.push({
                        id: batchDoc.id,
                        ...batchDoc.data()
                    });
                });

                results.push({
                    courseId: courseDoc.id,
                    courseTitle: courseData.title,
                    batchCount: batchesSnapshot.size,
                    batches
                });

                addLog(`${courseData.title}: ${batchesSnapshot.size} batches found`,
                    batchesSnapshot.size === 0 ? 'warning' : 'success');
            }

            setVerificationResults(results);
            addLog('Verification completed!', 'success');

        } catch (error) {
            addLog(`Error: ${error.message}`, 'error');
            console.error('Verification error:', error);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>🔧 Batch Data Migration Utility</h2>
                <p>Use this tool to migrate batch data from static files to Firestore</p>
            </div>

            <div style={styles.buttonContainer}>
                <button
                    onClick={migrateBatches}
                    disabled={migrating}
                    style={styles.button}
                >
                    {migrating ? '⏳ Migrating...' : '📤 Migrate Batches'}
                </button>

                <button
                    onClick={verifyBatches}
                    disabled={verifying}
                    style={styles.button}
                >
                    {verifying ? '⏳ Verifying...' : '🔍 Verify Batches'}
                </button>
            </div>

            {/* Logs */}
            {logs.length > 0 && (
                <div style={styles.logsContainer}>
                    <h3>Migration Logs</h3>
                    <div style={styles.logs}>
                        {logs.map((log, index) => (
                            <div key={index} style={{
                                ...styles.logEntry,
                                color: log.type === 'error' ? '#e74c3c' :
                                    log.type === 'warning' ? '#f39c12' :
                                        log.type === 'success' ? '#27ae60' : '#34495e'
                            }}>
                                <span style={styles.timestamp}>[{log.timestamp}]</span> {log.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Verification Results */}
            {verificationResults && (
                <div style={styles.resultsContainer}>
                    <h3>Verification Results</h3>
                    {verificationResults.map((result, index) => (
                        <div key={index} style={styles.resultCard}>
                            <h4>{result.courseTitle} ({result.courseId})</h4>
                            <p><strong>Batches Found:</strong> {result.batchCount}</p>
                            {result.batches.length > 0 && (
                                <ul style={styles.batchList}>
                                    {result.batches.map(batch => (
                                        <li key={batch.id}>
                                            Batch {batch.batchNumber}: {batch.batchName}
                                            <span style={styles.batchId}>(ID: {batch.id})</span>
                                            <br />
                                            <small>Status: {batch.status} | {batch.startDate} to {batch.endDate}</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {result.batchCount === 0 && (
                                <p style={{ color: '#e74c3c' }}>⚠️ No batches found - migration needed!</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #3498db'
    },
    buttonContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
    },
    button: {
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    logsContainer: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    logs: {
        maxHeight: '400px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
    },
    logEntry: {
        padding: '4px 0',
        borderBottom: '1px solid #f0f0f0'
    },
    timestamp: {
        color: '#6c757d',
        marginRight: '8px'
    },
    resultsContainer: {
        marginTop: '20px'
    },
    resultCard: {
        padding: '15px',
        marginBottom: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
    },
    batchList: {
        marginTop: '10px',
        paddingLeft: '20px'
    },
    batchId: {
        fontSize: '12px',
        color: '#6c757d',
        marginLeft: '8px'
    }
};

export default AdminBatchMigration;
