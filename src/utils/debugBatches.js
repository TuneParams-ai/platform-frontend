/**
 * Debug utility to inspect batch data in Firestore
 * Run this in browser console to check batch structure
 */

import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const debugBatchData = async (courseId) => {
    console.log(`\n🔍 Debugging batch data for course: ${courseId}\n`);

    try {
        // Get batches collection
        const batchesRef = collection(db, 'courses', courseId, 'batches');
        const snapshot = await getDocs(batchesRef);

        console.log(`📊 Total batches found: ${snapshot.size}\n`);

        if (snapshot.size === 0) {
            console.log('⚠️  No batches found!');
            console.log('💡 Run the migration tool from Admin Dashboard > Batch Migration');
            return;
        }

        // Log each batch
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n📦 Batch ${index + 1}:`);
            console.log(`   Document ID: ${doc.id}`);
            console.log(`   Batch Number: ${data.batchNumber}`);
            console.log(`   Batch Name: ${data.batchName}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Dates: ${data.startDate} to ${data.endDate}`);
            console.log(`   Capacity: ${data.enrollmentCount}/${data.maxCapacity}`);
            console.log(`   Class Links:`, data.classLinks);
            console.log(`   Full Data:`, data);
        });

        console.log('\n✅ Batch data inspection complete\n');

    } catch (error) {
        console.error('❌ Error fetching batch data:', error);
    }
};

export const debugAllCourses = async () => {
    console.log('\n🔍 Debugging all courses and their batches\n');

    try {
        const coursesRef = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesRef);

        console.log(`📊 Total courses: ${coursesSnapshot.size}\n`);

        for (const courseDoc of coursesSnapshot.docs) {
            const courseData = courseDoc.data();
            console.log(`\n📚 Course: ${courseData.title} (${courseDoc.id})`);

            // Get batches for this course
            const batchesRef = collection(db, 'courses', courseDoc.id, 'batches');
            const batchesSnapshot = await getDocs(batchesRef);

            console.log(`   Batches: ${batchesSnapshot.size}`);

            batchesSnapshot.forEach(batchDoc => {
                const batchData = batchDoc.data();
                console.log(`   ├─ Batch ${batchData.batchNumber}: ${batchData.batchName} (ID: ${batchDoc.id})`);
            });

            if (batchesSnapshot.size === 0) {
                console.log(`   ⚠️  No batches - migration needed!`);
            }
        }

        console.log('\n✅ All courses inspected\n');

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

// Make available in browser console
if (typeof window !== 'undefined') {
    window.debugBatchData = debugBatchData;
    window.debugAllCourses = debugAllCourses;

    console.log('🔧 Debug utilities loaded:');
    console.log('   - debugBatchData(courseId) - inspect batches for a specific course');
    console.log('   - debugAllCourses() - inspect all courses and their batches');
}
