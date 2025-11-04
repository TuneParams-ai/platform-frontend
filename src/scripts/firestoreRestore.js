/**
 * Firestore Restore Script
 * Restores data from JSON backup files
 */

const { initializeApp } = require('firebase/app');
const {
    getFirestore,
    collection,
    doc,
    setDoc,
    writeBatch,
    deleteDoc,
    getDocs
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Initialize readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Firebase config
const firebaseConfig = {
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
        console.log('✅ Firebase initialized for restore');
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

function restoreFirestoreTimestamp(timestampData) {
    if (timestampData && timestampData.type === 'firestore/timestamp/1.0') {
        return new Date(timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000);
    }
    return timestampData;
}

function processDocumentData(data) {
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
}

async function loadBackupFile(filePath) {
    try {
        console.log(`📁 Loading backup file: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Backup file not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const backupData = JSON.parse(fileContent);

        console.log(`✅ Backup file loaded successfully`);
        console.log(`📊 Backup created: ${new Date(backupData.timestamp).toLocaleString()}`);
        console.log(`📋 Collections available: ${Object.keys(backupData.collections).join(', ')}`);

        return backupData;

    } catch (error) {
        console.error(`❌ Error loading backup file: ${error.message}`);
        return null;
    }
}

async function restoreCollection(collectionName, documents, mode = 'replace') {
    console.log(`🔄 Restoring collection: ${collectionName} (${documents.length} documents)`);

    try {
        // If mode is 'replace', clear existing data first
        if (mode === 'replace') {
            console.log(`🗑️ Clearing existing ${collectionName} collection...`);
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
                    console.log(`  🗑️ Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(existingDocs.length / batchSize)}`);
                }

                console.log(`✅ Cleared ${existingDocs.length} existing documents`);
            }
        }

        // Restore documents in batches
        const batchSize = 400;

        for (let i = 0; i < documents.length; i += batchSize) {
            const batchDocs = documents.slice(i, i + batchSize);
            const restoreBatch = writeBatch(db);

            batchDocs.forEach(docData => {
                const docRef = doc(db, collectionName, docData.id);
                const processedData = processDocumentData(docData.data);
                restoreBatch.set(docRef, processedData);
            });

            await restoreBatch.commit();
            console.log(`  ✅ Restored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
        }

        console.log(`🎉 Successfully restored ${documents.length} documents to ${collectionName}`);

    } catch (error) {
        console.error(`❌ Error restoring ${collectionName}: ${error.message}`);
        throw error;
    }
}

async function performRestore(backupData, selectedCollections, mode = 'replace') {
    console.log(`🚨 Starting ${mode} restore operation...`);
    console.log(`📊 Restoring ${selectedCollections.length} collections`);

    try {
        let totalRestored = 0;

        for (const collectionName of selectedCollections) {
            const documents = backupData.collections[collectionName];
            if (documents && documents.length > 0) {
                await restoreCollection(collectionName, documents, mode);
                totalRestored += documents.length;
            } else {
                console.log(`⚠️ No documents found for ${collectionName}`);
            }
        }

        console.log(`🎉 RESTORE COMPLETED! Total documents restored: ${totalRestored}`);
        return true;

    } catch (error) {
        console.error(`❌ CRITICAL ERROR during restore: ${error.message}`);
        return false;
    }
}

async function selectCollections(backupData) {
    console.log('\n📋 Available collections:');
    const collections = Object.keys(backupData.collections);

    collections.forEach((name, index) => {
        const count = backupData.collections[name].length;
        console.log(`${index + 1}. ${name} (${count} documents)`);
    });

    console.log(`${collections.length + 1}. All collections`);

    const selection = await askQuestion('\nSelect collections to restore (comma-separated numbers or "all"): ');

    if (selection.toLowerCase() === 'all' || selection.includes(collections.length + 1)) {
        return collections;
    }

    const indices = selection.split(',').map(s => parseInt(s.trim()) - 1);
    const selected = indices
        .filter(i => i >= 0 && i < collections.length)
        .map(i => collections[i]);

    return selected;
}

async function confirmRestore(selectedCollections, mode) {
    console.log(`\n🚨 DANGER! This will ${mode === 'replace' ? 'REPLACE' : 'MERGE WITH'} the following collections:`);
    selectedCollections.forEach(name => console.log(`  - ${name}`));

    const confirm1 = await askQuestion('\nType "RESTORE" to confirm: ');
    if (confirm1 !== 'RESTORE') {
        return false;
    }

    const confirm2 = await askQuestion('Are you absolutely sure? Type "YES": ');
    return confirm2 === 'YES';
}

async function main() {
    console.log('🔄 Firestore Restore Tool\n');

    const initialized = await initializeFirebase();
    if (!initialized) {
        rl.close();
        return;
    }

    // Get backup file path
    const backupPath = await askQuestion('Enter the path to your backup file: ');
    const backupData = await loadBackupFile(backupPath);

    if (!backupData) {
        rl.close();
        return;
    }

    // Select collections
    const selectedCollections = await selectCollections(backupData);

    if (selectedCollections.length === 0) {
        console.log('❌ No collections selected');
        rl.close();
        return;
    }

    console.log(`\n📋 Selected collections: ${selectedCollections.join(', ')}`);

    // Select restore mode
    console.log('\nRestore modes:');
    console.log('1. REPLACE - Delete existing data and replace with backup');
    console.log('2. MERGE - Add backup data to existing data (may create duplicates)');

    const modeChoice = await askQuestion('Select mode (1 or 2): ');
    const mode = modeChoice === '2' ? 'merge' : 'replace';

    // Confirm restore
    const confirmed = await confirmRestore(selectedCollections, mode);

    if (!confirmed) {
        console.log('❌ Restore cancelled');
        rl.close();
        return;
    }

    // Perform restore
    const success = await performRestore(backupData, selectedCollections, mode);

    if (success) {
        console.log('\n🎉 Restore completed successfully!');
    } else {
        console.log('\n❌ Restore failed. Check the logs above for details.');
    }

    rl.close();
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