// Test Batch Migration Script
// This script will help migrate batch data from batch1/batch2 to batch3/batch4

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    writeBatch,
    query,
    where,
    limit
} from 'firebase/firestore';

// Firebase config - you'll need to replace this with your actual config
const firebaseConfig = {
    // Your Firebase config goes here
    // For now, we'll assume it's imported from your existing config
};

// Initialize Firebase (if not already done)
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.log('Firebase already initialized, using existing instance');
    // Import from your existing firebase config
    const { db: existingDb } = await import('../config/firebase.js');
    db = existingDb;
}

/**
 * Test function to see current batch data structure
 */
async function inspectCurrentBatchData() {
    console.log('🔍 Inspecting current batch data structure...\n');

    try {
        // 1. Check batch collections in courses
        console.log('📁 Checking course batch collections...');
        const coursesSnapshot = await getDocs(collection(db, 'courses'));

        for (const courseDoc of coursesSnapshot.docs) {
            const courseId = courseDoc.id;
            const courseData = courseDoc.data();
            console.log(`\n📚 Course: ${courseId} (${courseData.title || 'No title'})`);

            // Check batches subcollection
            const batchesSnapshot = await getDocs(collection(db, 'courses', courseId, 'batches'));

            if (batchesSnapshot.empty) {
                console.log('  ❌ No batches found in subcollection');
            } else {
                batchesSnapshot.docs.forEach(batchDoc => {
                    const batchData = batchDoc.data();
                    console.log(`  🎯 Batch ID: ${batchDoc.id}, Number: ${batchData.batchNumber}, Name: ${batchData.batchName || 'No name'}`);
                });
            }
        }

        // 2. Check enrollments collection
        console.log('\n\n📝 Checking enrollments...');
        const enrollmentsSnapshot = await getDocs(query(collection(db, 'enrollments'), limit(10)));

        enrollmentsSnapshot.docs.forEach(enrollDoc => {
            const enrollData = enrollDoc.data();
            console.log(`  📋 Enrollment ID: ${enrollDoc.id}`);
            console.log(`     User: ${enrollData.userId}`);
            console.log(`     Course: ${enrollData.courseId}`);
            console.log(`     Batch Number: ${enrollData.batchNumber}`);
            console.log(`     Status: ${enrollData.status}`);
            console.log('  ---');
        });

        // 3. Check for specific batch patterns
        console.log('\n\n🔍 Looking for batch1 and batch2 patterns...');

        // Check for enrollments with batchNumber 1 or 2
        const batch1Enrollments = await getDocs(
            query(collection(db, 'enrollments'), where('batchNumber', '==', 1), limit(5))
        );
        const batch2Enrollments = await getDocs(
            query(collection(db, 'enrollments'), where('batchNumber', '==', 2), limit(5))
        );

        console.log(`📊 Found ${batch1Enrollments.size} enrollments with batchNumber: 1`);
        console.log(`📊 Found ${batch2Enrollments.size} enrollments with batchNumber: 2`);

        // Show some examples
        if (!batch1Enrollments.empty) {
            console.log('\n📋 Sample Batch 1 enrollments:');
            batch1Enrollments.docs.slice(0, 3).forEach(doc => {
                const data = doc.data();
                console.log(`  - ${doc.id}: ${data.courseId}, User: ${data.userId}`);
            });
        }

        if (!batch2Enrollments.empty) {
            console.log('\n📋 Sample Batch 2 enrollments:');
            batch2Enrollments.docs.slice(0, 3).forEach(doc => {
                const data = doc.data();
                console.log(`  - ${doc.id}: ${data.courseId}, User: ${data.userId}`);
            });
        }

    } catch (error) {
        console.error('❌ Error inspecting data:', error);
    }
}

/**
 * Create test records for migration testing
 */
async function createTestRecords() {
    console.log('🧪 Creating test records for migration testing...\n');

    try {
        const batch = writeBatch(db);

        // Create test enrollments with batch 1 and 2
        const testEnrollments = [
            {
                id: 'test_user1_FAAI_batch1',
                data: {
                    userId: 'test_user1',
                    courseId: 'FAAI',
                    courseTitle: 'Financial AI Course',
                    batchNumber: 1,
                    batchStartDate: '2024-01-15',
                    batchEndDate: '2024-03-15',
                    status: 'enrolled',
                    enrolledAt: new Date(),
                    paymentMethod: 'test',
                    progress: 25
                }
            },
            {
                id: 'test_user2_FAAI_batch2',
                data: {
                    userId: 'test_user2',
                    courseId: 'FAAI',
                    courseTitle: 'Financial AI Course',
                    batchNumber: 2,
                    batchStartDate: '2024-02-15',
                    batchEndDate: '2024-04-15',
                    status: 'enrolled',
                    enrolledAt: new Date(),
                    paymentMethod: 'test',
                    progress: 50
                }
            },
            {
                id: 'test_user3_RLAI_batch1',
                data: {
                    userId: 'test_user3',
                    courseId: 'RLAI',
                    courseTitle: 'Reinforcement Learning AI',
                    batchNumber: 1,
                    batchStartDate: '2024-01-15',
                    batchEndDate: '2024-03-15',
                    status: 'enrolled',
                    enrolledAt: new Date(),
                    paymentMethod: 'test',
                    progress: 75
                }
            }
        ];

        testEnrollments.forEach(enrollment => {
            const docRef = doc(db, 'enrollments', enrollment.id);
            batch.set(docRef, enrollment.data);
        });

        await batch.commit();
        console.log('✅ Test records created successfully!');

        // Verify creation
        console.log('\n🔍 Verifying test records...');
        for (const enrollment of testEnrollments) {
            const docRef = doc(db, 'enrollments', enrollment.id);
            const docSnap = await getDocs(query(collection(db, 'enrollments'), where('userId', '==', enrollment.data.userId)));
            if (!docSnap.empty) {
                console.log(`✅ Test record ${enrollment.id} created successfully`);
            }
        }

    } catch (error) {
        console.error('❌ Error creating test records:', error);
    }
}

/**
 * Migrate batch numbers: 1 -> 3, 2 -> 4
 * This function will only update the test records first
 */
async function migrateBatchNumbersTest() {
    console.log('🔄 Starting test batch migration...\n');

    try {
        // Migration mapping
        const batchMapping = {
            1: 3,
            2: 4
        };

        let totalUpdated = 0;

        for (const [oldBatch, newBatch] of Object.entries(batchMapping)) {
            console.log(`🔄 Migrating batch ${oldBatch} to batch ${newBatch}...`);

            // Find test enrollments with the old batch number
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', parseInt(oldBatch)),
                where('userId', 'in', ['test_user1', 'test_user2', 'test_user3']) // Only test users
            );

            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

            if (enrollmentsSnapshot.empty) {
                console.log(`  ⚠️ No test enrollments found for batch ${oldBatch}`);
                continue;
            }

            const batch = writeBatch(db);
            let batchCount = 0;

            for (const enrollDoc of enrollmentsSnapshot.docs) {
                const oldData = enrollDoc.data();

                // Generate new enrollment ID with new batch number
                const newEnrollmentId = `${oldData.userId}_${oldData.courseId}_batch${newBatch}`;

                console.log(`  📝 Updating: ${enrollDoc.id} -> ${newEnrollmentId}`);

                // Create new document with updated batch number
                const newDocRef = doc(db, 'enrollments', newEnrollmentId);
                batch.set(newDocRef, {
                    ...oldData,
                    batchNumber: parseInt(newBatch),
                    migratedFrom: oldData.batchNumber,
                    migratedAt: new Date(),
                    originalEnrollmentId: enrollDoc.id
                });

                // Delete old document
                batch.delete(enrollDoc.ref);

                batchCount++;
            }

            if (batchCount > 0) {
                await batch.commit();
                console.log(`  ✅ Updated ${batchCount} enrollments for batch ${oldBatch} -> ${newBatch}`);
                totalUpdated += batchCount;
            }
        }

        console.log(`\n🎉 Test migration completed! Total records updated: ${totalUpdated}`);

        // Verify migration
        console.log('\n🔍 Verifying migration results...');
        for (const newBatch of [3, 4]) {
            const verifyQuery = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', newBatch),
                where('userId', 'in', ['test_user1', 'test_user2', 'test_user3'])
            );

            const verifySnapshot = await getDocs(verifyQuery);
            console.log(`✅ Found ${verifySnapshot.size} records with batch number ${newBatch}`);

            verifySnapshot.docs.forEach(doc => {
                const data = doc.data();
                console.log(`  - ${doc.id}: User ${data.userId}, Course ${data.courseId}, Migrated from batch ${data.migratedFrom}`);
            });
        }

    } catch (error) {
        console.error('❌ Error during test migration:', error);
    }
}

/**
 * Clean up test records
 */
async function cleanupTestRecords() {
    console.log('🧹 Cleaning up test records...\n');

    try {
        const testUserQuery = query(
            collection(db, 'enrollments'),
            where('userId', 'in', ['test_user1', 'test_user2', 'test_user3'])
        );

        const testSnapshot = await getDocs(testUserQuery);

        if (testSnapshot.empty) {
            console.log('ℹ️ No test records found to clean up');
            return;
        }

        const batch = writeBatch(db);

        testSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`✅ Cleaned up ${testSnapshot.size} test records`);

    } catch (error) {
        console.error('❌ Error cleaning up test records:', error);
    }
}

/**
 * Production migration function (to be used after testing)
 */
async function migrateBatchNumbersProduction() {
    console.log('🚨 PRODUCTION MIGRATION - Starting batch number migration...\n');
    console.log('⚠️ This will update ALL real enrollment records!');

    try {
        // Migration mapping
        const batchMapping = {
            1: 3,
            2: 4
        };

        let totalUpdated = 0;

        for (const [oldBatch, newBatch] of Object.entries(batchMapping)) {
            console.log(`🔄 Migrating ALL batch ${oldBatch} to batch ${newBatch}...`);

            // Find ALL enrollments with the old batch number (not just test ones)
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                where('batchNumber', '==', parseInt(oldBatch))
            );

            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

            if (enrollmentsSnapshot.empty) {
                console.log(`  ⚠️ No enrollments found for batch ${oldBatch}`);
                continue;
            }

            console.log(`  📊 Found ${enrollmentsSnapshot.size} enrollments to migrate for batch ${oldBatch}`);

            // Process in batches of 500 (Firestore limit)
            const batchSize = 500;
            const docs = enrollmentsSnapshot.docs;

            for (let i = 0; i < docs.length; i += batchSize) {
                const batchDocs = docs.slice(i, i + batchSize);
                const writeBatch = writeBatch(db);

                for (const enrollDoc of batchDocs) {
                    const oldData = enrollDoc.data();

                    // Generate new enrollment ID with new batch number
                    const newEnrollmentId = `${oldData.userId}_${oldData.courseId}_batch${newBatch}`;

                    console.log(`    📝 Updating: ${enrollDoc.id} -> ${newEnrollmentId}`);

                    // Create new document with updated batch number
                    const newDocRef = doc(db, 'enrollments', newEnrollmentId);
                    writeBatch.set(newDocRef, {
                        ...oldData,
                        batchNumber: parseInt(newBatch),
                        migratedFrom: oldData.batchNumber,
                        migratedAt: new Date(),
                        originalEnrollmentId: enrollDoc.id
                    });

                    // Delete old document
                    writeBatch.delete(enrollDoc.ref);
                }

                await writeBatch.commit();
                console.log(`    ✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(docs.length / batchSize)}`);
                totalUpdated += batchDocs.length;
            }

            console.log(`  ✅ Completed migration for batch ${oldBatch} -> ${newBatch}`);
        }

        console.log(`\n🎉 PRODUCTION migration completed! Total records updated: ${totalUpdated}`);

    } catch (error) {
        console.error('❌ Error during production migration:', error);
    }
}

// Export functions for use
export {
    inspectCurrentBatchData,
    createTestRecords,
    migrateBatchNumbersTest,
    cleanupTestRecords,
    migrateBatchNumbersProduction
};

// Main execution function
async function main() {
    console.log('🚀 Batch Migration Script\n');
    console.log('This script will help migrate batch data:');
    console.log('- Batch 1 -> Batch 3');
    console.log('- Batch 2 -> Batch 4\n');

    // You can uncomment the functions you want to run:

    // 1. First, inspect current data
    await inspectCurrentBatchData();

    // 2. Create test records for testing
    // await createTestRecords();

    // 3. Test migration with test records only
    // await migrateBatchNumbersTest();

    // 4. Clean up test records
    // await cleanupTestRecords();

    // 5. Production migration (ONLY after thorough testing)
    // await migrateBatchNumbersProduction();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}