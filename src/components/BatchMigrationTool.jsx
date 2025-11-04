import React, { useState } from 'react';
import {
    collection,
    getDocs,
    doc,
    writeBatch,
    query,
    where,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

const BatchMigrationTool = () => {
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
        console.log(`[${timestamp}] ${message}`);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    // Step 1: Inspect current batch data
    const inspectCurrentData = async () => {
        setIsRunning(true);
        addLog('🔍 Starting data inspection...', 'info');

        try {
            // Check enrollments with batch 1 and 2
            const batch1Query = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', 1),
                limit(10)
            );

            const batch2Query = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', 2),
                limit(10)
            );

            const [batch1Snap, batch2Snap] = await Promise.all([
                getDocs(batch1Query),
                getDocs(batch2Query)
            ]);

            addLog(`📊 Found ${batch1Snap.size} enrollments with batch number 1`, 'success');
            addLog(`📊 Found ${batch2Snap.size} enrollments with batch number 2`, 'success');

            // Show sample data
            if (!batch1Snap.empty) {
                addLog('📋 Sample Batch 1 enrollments:', 'info');
                batch1Snap.docs.slice(0, 3).forEach(docSnap => {
                    const data = docSnap.data();
                    addLog(`  - ${docSnap.id}: ${data.courseId}, User: ${data.userId}`, 'info');
                });
            }

            if (!batch2Snap.empty) {
                addLog('📋 Sample Batch 2 enrollments:', 'info');
                batch2Snap.docs.slice(0, 3).forEach(docSnap => {
                    const data = docSnap.data();
                    addLog(`  - ${docSnap.id}: ${data.courseId}, User: ${data.userId}`, 'info');
                });
            }

            addLog('✅ Data inspection completed', 'success');

        } catch (error) {
            addLog(`❌ Error during inspection: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    // Step 2: Create test records
    const createTestRecords = async () => {
        setIsRunning(true);
        addLog('🧪 Creating test records...', 'info');

        try {
            const batch = writeBatch(db);

            const testEnrollments = [
                {
                    id: 'TEST_migrate_user1_FAAI_batch1',
                    data: {
                        userId: 'TEST_migrate_user1',
                        courseId: 'FAAI',
                        courseTitle: 'Financial AI Course (TEST)',
                        batchNumber: 1,
                        batchStartDate: '2024-01-15',
                        batchEndDate: '2024-03-15',
                        status: 'enrolled',
                        enrolledAt: new Date(),
                        paymentMethod: 'test',
                        progress: 25,
                        isTestRecord: true
                    }
                },
                {
                    id: 'TEST_migrate_user2_FAAI_batch2',
                    data: {
                        userId: 'TEST_migrate_user2',
                        courseId: 'FAAI',
                        courseTitle: 'Financial AI Course (TEST)',
                        batchNumber: 2,
                        batchStartDate: '2024-02-15',
                        batchEndDate: '2024-04-15',
                        status: 'enrolled',
                        enrolledAt: new Date(),
                        paymentMethod: 'test',
                        progress: 50,
                        isTestRecord: true
                    }
                }
            ];

            for (const enrollment of testEnrollments) {
                const docRef = doc(db, 'enrollments', enrollment.id);
                batch.set(docRef, enrollment.data);
            }

            await batch.commit();
            addLog(`✅ Created ${testEnrollments.length} test records`, 'success');

            // Verify creation
            for (const enrollment of testEnrollments) {
                const docSnap = await getDocs(query(
                    collection(db, 'enrollments'),
                    where('userId', '==', enrollment.data.userId)
                ));

                if (!docSnap.empty) {
                    addLog(`✅ Verified test record: ${enrollment.id}`, 'success');
                }
            }

        } catch (error) {
            addLog(`❌ Error creating test records: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    // Step 3: Test migration on test records only
    const testMigration = async () => {
        setIsRunning(true);
        addLog('🔄 Starting test migration (batch 1->3, batch 2->4)...', 'info');

        try {
            const batchMapping = { 1: 3, 2: 4 };
            let totalUpdated = 0;

            for (const [oldBatch, newBatch] of Object.entries(batchMapping)) {
                addLog(`🔄 Migrating test batch ${oldBatch} to batch ${newBatch}...`, 'info');

                // Find only test enrollments
                const enrollmentsQuery = query(
                    collection(db, 'enrollments'),
                    where('batchNumber', '==', parseInt(oldBatch)),
                    where('isTestRecord', '==', true)
                );

                const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

                if (enrollmentsSnapshot.empty) {
                    addLog(`  ⚠️ No test enrollments found for batch ${oldBatch}`, 'warning');
                    continue;
                }

                addLog(`  📊 Found ${enrollmentsSnapshot.size} test enrollments for batch ${oldBatch}`, 'info');

                const migrationBatch = writeBatch(db);

                for (const enrollDoc of enrollmentsSnapshot.docs) {
                    const oldData = enrollDoc.data();

                    // Generate new enrollment ID
                    const newEnrollmentId = `${oldData.userId}_${oldData.courseId}_batch${newBatch}`;

                    addLog(`    📝 ${enrollDoc.id} -> ${newEnrollmentId}`, 'info');

                    // Create new document
                    const newDocRef = doc(db, 'enrollments', newEnrollmentId);
                    migrationBatch.set(newDocRef, {
                        ...oldData,
                        batchNumber: parseInt(newBatch),
                        migratedFrom: oldData.batchNumber,
                        migratedAt: new Date(),
                        originalEnrollmentId: enrollDoc.id
                    });

                    // Delete old document
                    migrationBatch.delete(enrollDoc.ref);
                }

                await migrationBatch.commit();
                totalUpdated += enrollmentsSnapshot.size;
                addLog(`  ✅ Migrated ${enrollmentsSnapshot.size} records for batch ${oldBatch}`, 'success');
            }

            addLog(`🎉 Test migration completed! Total: ${totalUpdated} records`, 'success');

            // Verify migration
            addLog('🔍 Verifying migration results...', 'info');
            for (const newBatch of [3, 4]) {
                const verifyQuery = query(
                    collection(db, 'enrollments'),
                    where('batchNumber', '==', newBatch),
                    where('isTestRecord', '==', true)
                );

                const verifySnapshot = await getDocs(verifyQuery);
                addLog(`✅ Found ${verifySnapshot.size} test records with batch ${newBatch}`, 'success');
            }

        } catch (error) {
            addLog(`❌ Error during test migration: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    // Step 4: Cleanup test records
    const cleanupTestRecords = async () => {
        setIsRunning(true);
        addLog('🧹 Cleaning up test records...', 'info');

        try {
            const testQuery = query(
                collection(db, 'enrollments'),
                where('isTestRecord', '==', true)
            );

            const testSnapshot = await getDocs(testQuery);

            if (testSnapshot.empty) {
                addLog('ℹ️ No test records found to clean up', 'info');
                return;
            }

            const cleanupBatch = writeBatch(db);

            testSnapshot.docs.forEach(docSnap => {
                cleanupBatch.delete(docSnap.ref);
            });

            await cleanupBatch.commit();
            addLog(`✅ Cleaned up ${testSnapshot.size} test records`, 'success');

        } catch (error) {
            addLog(`❌ Error cleaning up: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    // Step 5: Production migration (DANGER!)
    const productionMigration = async () => {
        const confirmed = window.confirm(
            '🚨 DANGER! This will update ALL real enrollment records in production.\n\n' +
            'Are you absolutely sure you want to proceed?\n\n' +
            'This action cannot be easily undone!'
        );

        if (!confirmed) {
            addLog('❌ Production migration cancelled by user', 'warning');
            return;
        }

        setIsRunning(true);
        addLog('🚨 STARTING PRODUCTION MIGRATION - ALL REAL DATA WILL BE UPDATED!', 'error');

        try {
            const batchMapping = { 1: 3, 2: 4 };
            let totalUpdated = 0;

            for (const [oldBatch, newBatch] of Object.entries(batchMapping)) {
                addLog(`🔄 Migrating ALL real batch ${oldBatch} to batch ${newBatch}...`, 'info');

                // Find ALL enrollments (not just test)
                const enrollmentsQuery = query(
                    collection(db, 'enrollments'),
                    where('batchNumber', '==', parseInt(oldBatch))
                );

                const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

                if (enrollmentsSnapshot.empty) {
                    addLog(`  ⚠️ No enrollments found for batch ${oldBatch}`, 'warning');
                    continue;
                }

                addLog(`  📊 Found ${enrollmentsSnapshot.size} REAL enrollments for batch ${oldBatch}`, 'info');

                // Process in smaller batches to avoid Firestore limits
                const docs = enrollmentsSnapshot.docs;
                const batchSize = 400; // Conservative batch size

                for (let i = 0; i < docs.length; i += batchSize) {
                    const batchDocs = docs.slice(i, i + batchSize);
                    const prodBatch = writeBatch(db);

                    for (const enrollDoc of batchDocs) {
                        const oldData = enrollDoc.data();
                        const newEnrollmentId = `${oldData.userId}_${oldData.courseId}_batch${newBatch}`;

                        const newDocRef = doc(db, 'enrollments', newEnrollmentId);
                        prodBatch.set(newDocRef, {
                            ...oldData,
                            batchNumber: parseInt(newBatch),
                            migratedFrom: oldData.batchNumber,
                            migratedAt: new Date(),
                            originalEnrollmentId: enrollDoc.id
                        });

                        prodBatch.delete(enrollDoc.ref);
                    }

                    await prodBatch.commit();
                    addLog(`    ✅ Processed ${Math.floor(i / batchSize) + 1}/${Math.ceil(docs.length / batchSize)} batches`, 'success');
                    totalUpdated += batchDocs.length;
                }

                addLog(`  ✅ Completed migration for batch ${oldBatch} -> ${newBatch}`, 'success');
            }

            addLog(`🎉 PRODUCTION MIGRATION COMPLETED! Total: ${totalUpdated} records`, 'success');

        } catch (error) {
            addLog(`❌ CRITICAL ERROR in production migration: ${error.message}`, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    const stepActions = {
        inspect: { action: inspectCurrentData, label: '🔍 Inspect Current Data', description: 'Check existing batch data structure' },
        createTest: { action: createTestRecords, label: '🧪 Create Test Records', description: 'Create sample records for testing' },
        migrateTest: { action: testMigration, label: '🔄 Test Migration', description: 'Migrate test records only (1→3, 2→4)' },
        cleanup: { action: cleanupTestRecords, label: '🧹 Cleanup Test Records', description: 'Remove all test records' },
        production: { action: productionMigration, label: '🚨 PRODUCTION Migration', description: 'Migrate ALL real data (DANGER!)' }
    };

    return (
        <div className="batch-migration-tool" style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
            <div className="header" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2>🔄 Batch Migration Tool</h2>
                <p>Migrate batch numbers: Batch 1 → Batch 3, Batch 2 → Batch 4</p>
                <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
                    <strong>⚠️ Important:</strong> Always test with sample records before running on production data!
                </div>
            </div>

            <div className="controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {Object.entries(stepActions).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={config.action}
                        disabled={isRunning}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: key === 'production' ? '#dc3545' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                            opacity: isRunning ? 0.6 : 1
                        }}
                        title={config.description}
                    >
                        {config.label}
                    </button>
                ))}

                <button
                    onClick={clearLogs}
                    disabled={isRunning}
                    style={{
                        padding: '10px 15px',
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
                    ⏳ Operation in progress... Please wait.
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
                    📋 Migration Logs ({logs.length} entries)
                </div>
                {logs.length === 0 ? (
                    <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        No logs yet. Run an action to see results here.
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
                <h4>📖 Instructions:</h4>
                <ol>
                    <li><strong>Inspect Current Data:</strong> See what batch data exists in your database</li>
                    <li><strong>Create Test Records:</strong> Add sample data to test the migration safely</li>
                    <li><strong>Test Migration:</strong> Run migration on test records only to verify it works</li>
                    <li><strong>Cleanup Test Records:</strong> Remove test data after successful testing</li>
                    <li><strong>Production Migration:</strong> ⚠️ Only after thorough testing - migrates ALL real data!</li>
                </ol>
            </div>
        </div>
    );
};

export default BatchMigrationTool;