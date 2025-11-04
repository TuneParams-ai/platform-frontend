/**
 * Standalone Batch Migration Script
 * 
 * This script can be run from the command line to migrate batch data.
 * It provides a menu-driven interface for safe migration testing.
 * 
 * To run this script:
 * 1. Make sure you're in the project root directory
 * 2. Run: node src/scripts/batchMigrationCLI.js
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    writeBatch,
    query,
    where,
    limit
} from 'firebase/firestore';
import readline from 'readline';

// Initialize readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Firebase config - you'll need to set this up
const firebaseConfig = {
    // Your Firebase config will be loaded from environment or config file
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let db;

async function initializeFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error.message);
        return false;
    }
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function inspectCurrentData() {
    console.log('\n🔍 Inspecting current batch data...\n');

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

        console.log(`📊 Found ${batch1Snap.size} enrollments with batch number 1`);
        console.log(`📊 Found ${batch2Snap.size} enrollments with batch number 2`);

        // Show sample data
        if (!batch1Snap.empty) {
            console.log('\n📋 Sample Batch 1 enrollments:');
            batch1Snap.docs.slice(0, 3).forEach(docSnap => {
                const data = docSnap.data();
                console.log(`  - ${docSnap.id}: ${data.courseId}, User: ${data.userId}`);
            });
        }

        if (!batch2Snap.empty) {
            console.log('\n📋 Sample Batch 2 enrollments:');
            batch2Snap.docs.slice(0, 3).forEach(docSnap => {
                const data = docSnap.data();
                console.log(`  - ${docSnap.id}: ${data.courseId}, User: ${data.userId}`);
            });
        }

        console.log('\n✅ Data inspection completed');

    } catch (error) {
        console.error(`❌ Error during inspection: ${error.message}`);
    }
}

async function createTestRecords() {
    console.log('\n🧪 Creating test records...\n');

    try {
        const batch = writeBatch(db);

        const testEnrollments = [
            {
                id: 'CLI_TEST_user1_FAAI_batch1',
                data: {
                    userId: 'CLI_TEST_user1',
                    courseId: 'FAAI',
                    courseTitle: 'Financial AI Course (CLI TEST)',
                    batchNumber: 1,
                    batchStartDate: '2024-01-15',
                    batchEndDate: '2024-03-15',
                    status: 'enrolled',
                    enrolledAt: new Date(),
                    paymentMethod: 'test',
                    progress: 25,
                    isTestRecord: true,
                    createdBy: 'CLI_migration_script'
                }
            },
            {
                id: 'CLI_TEST_user2_FAAI_batch2',
                data: {
                    userId: 'CLI_TEST_user2',
                    courseId: 'FAAI',
                    courseTitle: 'Financial AI Course (CLI TEST)',
                    batchNumber: 2,
                    batchStartDate: '2024-02-15',
                    batchEndDate: '2024-04-15',
                    status: 'enrolled',
                    enrolledAt: new Date(),
                    paymentMethod: 'test',
                    progress: 50,
                    isTestRecord: true,
                    createdBy: 'CLI_migration_script'
                }
            }
        ];

        for (const enrollment of testEnrollments) {
            const docRef = doc(db, 'enrollments', enrollment.id);
            batch.set(docRef, enrollment.data);
        }

        await batch.commit();
        console.log(`✅ Created ${testEnrollments.length} test records`);

    } catch (error) {
        console.error(`❌ Error creating test records: ${error.message}`);
    }
}

async function testMigration() {
    console.log('\n🔄 Starting test migration (batch 1->3, batch 2->4)...\n');

    try {
        const batchMapping = { 1: 3, 2: 4 };
        let totalUpdated = 0;

        for (const [oldBatch, newBatch] of Object.entries(batchMapping)) {
            console.log(`🔄 Migrating test batch ${oldBatch} to batch ${newBatch}...`);

            // Find only test enrollments created by CLI
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', parseInt(oldBatch)),
                where('createdBy', '==', 'CLI_migration_script')
            );

            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

            if (enrollmentsSnapshot.empty) {
                console.log(`  ⚠️ No CLI test enrollments found for batch ${oldBatch}`);
                continue;
            }

            console.log(`  📊 Found ${enrollmentsSnapshot.size} CLI test enrollments for batch ${oldBatch}`);

            const migrationBatch = writeBatch(db);

            for (const enrollDoc of enrollmentsSnapshot.docs) {
                const oldData = enrollDoc.data();

                // Generate new enrollment ID
                const newEnrollmentId = `${oldData.userId}_${oldData.courseId}_batch${newBatch}`;

                console.log(`    📝 ${enrollDoc.id} -> ${newEnrollmentId}`);

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
            console.log(`  ✅ Migrated ${enrollmentsSnapshot.size} records for batch ${oldBatch}`);
        }

        console.log(`🎉 Test migration completed! Total: ${totalUpdated} records`);

        // Verify migration
        console.log('🔍 Verifying migration results...');
        for (const newBatch of [3, 4]) {
            const verifyQuery = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', newBatch),
                where('createdBy', '==', 'CLI_migration_script')
            );

            const verifySnapshot = await getDocs(verifyQuery);
            console.log(`✅ Found ${verifySnapshot.size} test records with batch ${newBatch}`);
        }

    } catch (error) {
        console.error(`❌ Error during test migration: ${error.message}`);
    }
}

async function cleanupTestRecords() {
    console.log('\n🧹 Cleaning up CLI test records...\n');

    try {
        const testQuery = query(
            collection(db, 'enrollments'),
            where('createdBy', '==', 'CLI_migration_script')
        );

        const testSnapshot = await getDocs(testQuery);

        if (testSnapshot.empty) {
            console.log('ℹ️ No CLI test records found to clean up');
            return;
        }

        const cleanupBatch = writeBatch(db);

        testSnapshot.docs.forEach(docSnap => {
            cleanupBatch.delete(docSnap.ref);
        });

        await cleanupBatch.commit();
        console.log(`✅ Cleaned up ${testSnapshot.size} CLI test records`);

    } catch (error) {
        console.error(`❌ Error cleaning up: ${error.message}`);
    }
}

async function productionMigration() {
    console.log('\n🚨 PRODUCTION MIGRATION WARNING! 🚨');
    console.log('This will update ALL real enrollment records in your database!');
    console.log('This action cannot be easily undone!');

    const confirm1 = await askQuestion('\nType "MIGRATE" to confirm you want to proceed with production migration: ');

    if (confirm1 !== 'MIGRATE') {
        console.log('❌ Production migration cancelled');
        return;
    }

    const confirm2 = await askQuestion('Are you absolutely sure? Type "YES" to continue: ');

    if (confirm2 !== 'YES') {
        console.log('❌ Production migration cancelled');
        return;
    }

    console.log('\n🚨 STARTING PRODUCTION MIGRATION - ALL REAL DATA WILL BE UPDATED!\n');

    try {
        const batchMapping = { 1: 3, 2: 4 };
        let totalUpdated = 0;

        for (const [oldBatch, newBatch] of Object.entries(batchMapping)) {
            console.log(`🔄 Migrating ALL real batch ${oldBatch} to batch ${newBatch}...`);

            // Find ALL enrollments (not just test) - exclude test records
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', parseInt(oldBatch))
            );

            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

            // Filter out test records
            const realEnrollments = enrollmentsSnapshot.docs.filter(doc => {
                const data = doc.data();
                return !data.isTestRecord && !data.createdBy;
            });

            if (realEnrollments.length === 0) {
                console.log(`  ⚠️ No real enrollments found for batch ${oldBatch}`);
                continue;
            }

            console.log(`  📊 Found ${realEnrollments.length} REAL enrollments for batch ${oldBatch}`);

            // Process in smaller batches to avoid Firestore limits
            const batchSize = 400;

            for (let i = 0; i < realEnrollments.length; i += batchSize) {
                const batchDocs = realEnrollments.slice(i, i + batchSize);
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
                console.log(`    ✅ Processed ${Math.floor(i / batchSize) + 1}/${Math.ceil(realEnrollments.length / batchSize)} batches`);
                totalUpdated += batchDocs.length;
            }

            console.log(`  ✅ Completed migration for batch ${oldBatch} -> ${newBatch}`);
        }

        console.log(`\n🎉 PRODUCTION MIGRATION COMPLETED! Total: ${totalUpdated} records`);

    } catch (error) {
        console.error(`❌ CRITICAL ERROR in production migration: ${error.message}`);
    }
}

async function showMenu() {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 BATCH MIGRATION TOOL');
    console.log('='.repeat(60));
    console.log('Migrate batch numbers: Batch 1 → Batch 3, Batch 2 → Batch 4');
    console.log('='.repeat(60));
    console.log();
    console.log('1. 🔍 Inspect Current Data');
    console.log('2. 🧪 Create Test Records');
    console.log('3. 🔄 Test Migration (test records only)');
    console.log('4. 🧹 Cleanup Test Records');
    console.log('5. 🚨 PRODUCTION Migration (ALL REAL DATA!)');
    console.log('6. ❌ Exit');
    console.log();

    const choice = await askQuestion('Select an option (1-6): ');

    switch (choice) {
        case '1':
            await inspectCurrentData();
            break;
        case '2':
            await createTestRecords();
            break;
        case '3':
            await testMigration();
            break;
        case '4':
            await cleanupTestRecords();
            break;
        case '5':
            await productionMigration();
            break;
        case '6':
            console.log('\n👋 Goodbye!');
            rl.close();
            return false;
        default:
            console.log('\n❌ Invalid option. Please select 1-6.');
    }

    return true;
}

async function main() {
    console.log('🚀 Batch Migration CLI Tool Starting...\n');

    const initialized = await initializeFirebase();
    if (!initialized) {
        console.log('❌ Failed to initialize Firebase. Please check your configuration.');
        rl.close();
        return;
    }

    let continueRunning = true;
    while (continueRunning) {
        continueRunning = await showMenu();

        if (continueRunning) {
            await askQuestion('\nPress Enter to continue...');
        }
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Process interrupted. Goodbye!');
    rl.close();
    process.exit(0);
});

// Run the main function
main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    rl.close();
    process.exit(1);
});