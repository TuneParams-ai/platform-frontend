// Migration script to ensure batches are properly stored in Firestore
// Run this in the browser console while logged in as admin

import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { coursesData } from '../data/coursesData';

/**
 * This script migrates batch data from coursesData.js to Firestore
 * It ensures all batches are stored as subcollections under their respective courses
 */
export const migrateBatchesToFirestore = async () => {
    console.log('🚀 Starting batch migration to Firestore...');

    try {
        for (const course of coursesData) {
            console.log(`\n📚 Processing course: ${course.title} (${course.id})`);

            if (!course.batches || course.batches.length === 0) {
                console.log(`  ⏭️  No batches to migrate for ${course.id}`);
                continue;
            }

            // Check if batches already exist in Firestore
            const batchesRef = collection(db, 'courses', course.id, 'batches');
            const existingBatches = await getDocs(batchesRef);

            console.log(`  📊 Found ${existingBatches.size} existing batches in Firestore`);
            console.log(`  📊 Found ${course.batches.length} batches in coursesData.js`);

            // If batches already exist, ask before overwriting
            if (existingBatches.size > 0) {
                console.log(`  ℹ️  Batches already exist. Skipping...`);
                console.log(`  💡 To force re-migration, delete the batches subcollection first`);
                continue;
            }

            // Migrate each batch
            for (const batch of course.batches) {
                console.log(`  ➕ Migrating Batch ${batch.batchNumber}: ${batch.batchName}`);

                // Create a new document with auto-generated ID
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

                console.log(`  ✅ Batch ${batch.batchNumber} migrated with ID: ${batchDocRef.id}`);

                // Migrate videos if they exist
                if (batch.videos && batch.videos.length > 0) {
                    console.log(`    🎥 Migrating ${batch.videos.length} videos...`);
                    for (const video of batch.videos) {
                        const videoDocRef = doc(collection(db, 'courses', course.id, 'batches', batchDocRef.id, 'videos'));
                        await setDoc(videoDocRef, {
                            title: video.title,
                            youtubeUrl: video.youtubeUrl,
                            thumbnail: video.thumbnail,
                            order: batch.videos.indexOf(video),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                    console.log(`    ✅ Videos migrated`);
                }

                // Migrate schedule if it exists
                if (batch.schedule && batch.schedule.length > 0) {
                    console.log(`    📅 Migrating ${batch.schedule.length} schedule entries...`);
                    for (const scheduleEntry of batch.schedule) {
                        const scheduleDocRef = doc(collection(db, 'courses', course.id, 'batches', batchDocRef.id, 'schedule'));
                        await setDoc(scheduleDocRef, {
                            ...scheduleEntry,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                    console.log(`    ✅ Schedule migrated`);
                }
            }

            console.log(`✅ Completed migration for ${course.id}`);
        }

        console.log('\n🎉 Batch migration completed successfully!');
        return { success: true, message: 'All batches migrated successfully' };

    } catch (error) {
        console.error('❌ Error during batch migration:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verify batch data in Firestore
 */
export const verifyBatchesInFirestore = async () => {
    console.log('🔍 Verifying batches in Firestore...\n');

    try {
        const coursesRef = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesRef);

        for (const courseDoc of coursesSnapshot.docs) {
            const courseData = courseDoc.data();
            console.log(`📚 Course: ${courseData.title} (${courseDoc.id})`);

            const batchesRef = collection(db, 'courses', courseDoc.id, 'batches');
            const batchesSnapshot = await getDocs(batchesRef);

            console.log(`  📊 Total batches: ${batchesSnapshot.size}`);

            if (batchesSnapshot.size === 0) {
                console.log(`  ⚠️  WARNING: No batches found!`);
            } else {
                batchesSnapshot.forEach(batchDoc => {
                    const batchData = batchDoc.data();
                    console.log(`    ✓ Batch ${batchData.batchNumber}: ${batchData.batchName} (ID: ${batchDoc.id})`);
                    console.log(`      Status: ${batchData.status}, Dates: ${batchData.startDate} to ${batchData.endDate}`);
                });
            }
            console.log('');
        }

        console.log('✅ Verification complete!');

    } catch (error) {
        console.error('❌ Error during verification:', error);
    }
};

// Export for browser console usage
if (typeof window !== 'undefined') {
    window.migrateBatchesToFirestore = migrateBatchesToFirestore;
    window.verifyBatchesInFirestore = verifyBatchesInFirestore;
}
