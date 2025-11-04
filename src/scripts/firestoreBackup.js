/**
 * Firestore Backup Script
 * Creates a JSON backup of critical Firestore collections
 */

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase config - load from environment or config
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
}; let db;

async function initializeFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log('✅ Firebase initialized for backup');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error.message);
        return false;
    }
}

async function backupCollection(collectionName) {
    console.log(`📦 Backing up collection: ${collectionName}`);

    try {
        const snapshot = await getDocs(collection(db, collectionName));
        const data = [];

        snapshot.docs.forEach(doc => {
            data.push({
                id: doc.id,
                data: doc.data()
            });
        });

        console.log(`✅ ${collectionName}: ${data.length} documents backed up`);
        return data;

    } catch (error) {
        console.error(`❌ Error backing up ${collectionName}:`, error.message);
        return [];
    }
}

async function backupSubcollection(parentPath, subcollectionName) {
    const fullPath = `${parentPath}/${subcollectionName}`;
    console.log(`📦 Backing up subcollection: ${fullPath}`);

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

        console.log(`✅ ${fullPath}: ${data.length} documents backed up`);
        return data;

    } catch (error) {
        console.error(`❌ Error backing up ${fullPath}:`, error.message);
        return [];
    }
}

async function backupCourseSpecificBatches() {
    console.log('🗂️ Backing up course-specific batch subcollections...');
    const courseSpecificBatches = {};

    const courses = ['FAAI', 'RLAI'];
    for (const courseId of courses) {
        try {
            const courseBatches = await backupSubcollection(`courses/${courseId}`, 'batches');
            if (courseBatches.length > 0) {
                courseSpecificBatches[`courses/${courseId}/batches`] = courseBatches;
            }
        } catch (error) {
            console.log(`⚠️ Could not backup batches for course ${courseId}:`, error.message);
        }
    }

    return courseSpecificBatches;
}

async function discoverCollections() {
    console.log('🔍 Discovering all collections in database...');

    // Comprehensive list of known collections
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
        'roles', // backup compatibility
        'audit_logs',
        'email_tracking',
        'progress_tracking',
        'batches',
        'videos',
        'schedule',
        'notifications'
    ];

    // Test which collections actually exist
    const existingCollections = [];

    for (const collectionName of knownCollections) {
        try {
            const testSnapshot = await getDocs(collection(db, collectionName));
            existingCollections.push(collectionName);
            console.log(`✅ Found collection: ${collectionName} (${testSnapshot.size} documents)`);
        } catch (error) {
            console.log(`⚠️ Collection not accessible: ${collectionName}`);
        }
    }

    console.log(`📊 Total collections found: ${existingCollections.length}\n`);
    return existingCollections;
}

async function createBackup() {
    console.log('🛡️ Starting comprehensive Firestore backup...\n');

    const initialized = await initializeFirebase();
    if (!initialized) {
        return;
    }

    // Create backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
        new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const backupDir = `firestore-backup-${timestamp}`;

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    console.log(`📁 Created backup directory: ${backupDir}\n`);

    // Discover all collections dynamically
    const collections = await discoverCollections();

    // Backup course-specific subcollections
    const courseSpecificBatches = await backupCourseSpecificBatches();

    const backup = {
        timestamp: new Date().toISOString(),
        version: '3.0', // Updated version for subcollections
        description: 'Comprehensive backup including all collections and course-specific subcollections',
        totalCollections: collections.length + Object.keys(courseSpecificBatches).length,
        collections: {},
        subcollections: courseSpecificBatches
    };

    // Backup each collection
    for (const collectionName of collections) {
        const collectionData = await backupCollection(collectionName);
        backup.collections[collectionName] = collectionData;

        // Also save individual collection files
        const collectionFile = path.join(backupDir, `${collectionName}.json`);
        fs.writeFileSync(collectionFile, JSON.stringify(collectionData, null, 2));
    }

    // Save individual subcollection files
    for (const [path, data] of Object.entries(courseSpecificBatches)) {
        const sanitizedPath = path.replace(/\//g, '_');
        const subcollectionFile = path.join(backupDir, `${sanitizedPath}.json`);
        fs.writeFileSync(subcollectionFile, JSON.stringify(data, null, 2));
    }

    // Save complete backup file
    const backupFile = path.join(backupDir, 'complete-backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    // Create backup summary
    const summary = {
        timestamp: backup.timestamp,
        totalCollections: collections.length + Object.keys(courseSpecificBatches).length,
        collections: {},
        subcollections: {}
    };

    let totalDocuments = 0;
    for (const [name, data] of Object.entries(backup.collections)) {
        summary.collections[name] = data.length;
        totalDocuments += data.length;
    }

    for (const [path, data] of Object.entries(courseSpecificBatches)) {
        summary.subcollections[path] = data.length;
        totalDocuments += data.length;
    }

    summary.totalDocuments = totalDocuments;

    const summaryFile = path.join(backupDir, 'backup-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup location: ${path.resolve(backupDir)}`);
    console.log(`📊 Total documents backed up: ${totalDocuments}`);
    console.log('\n📋 Backup contents:');

    for (const [name, count] of Object.entries(summary.collections)) {
        console.log(`  - ${name}: ${count} documents`);
    }

    for (const [path, count] of Object.entries(summary.subcollections)) {
        console.log(`  - ${path}: ${count} documents`);
    }

    console.log('\n📄 Files created:');
    console.log(`  - complete-backup.json (full backup)`);
    console.log(`  - backup-summary.json (summary)`);
    collections.forEach(name => {
        console.log(`  - ${name}.json (individual collection)`);
    });
    Object.keys(courseSpecificBatches).forEach(path => {
        const sanitizedPath = path.replace(/\//g, '_');
        console.log(`  - ${sanitizedPath}.json (individual subcollection)`);
    });

    return backupDir;
}

// Run if called directly
if (require.main === module) {
    createBackup().catch(console.error);
}

module.exports = { createBackup };