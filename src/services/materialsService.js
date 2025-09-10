// src/services/materialsService.js
// Service for managing course materials and file uploads

import { db, storage } from '../config/firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

const MATERIALS_COLLECTION = 'courseMaterials';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @param {number} week - Week number
 * @param {string} materialType - Type of material (video, slides, assignment, etc.)
 * @returns {Promise<Object>} Upload result with download URL
 */
export const uploadMaterial = async (file, courseId, batchNumber, week, materialType) => {
    try {
        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `${courseId}/batch${batchNumber}/week${week}/${materialType}/${timestamp}_${file.name}`;

        // Create storage reference
        const storageRef = ref(storage, `materials/${fileName}`);

        // Upload file
        const uploadResult = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(uploadResult.ref);

        return {
            success: true,
            downloadURL,
            fileName,
            filePath: uploadResult.ref.fullPath
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Create a new material entry in Firestore
 * @param {Object} materialData - Material information
 * @returns {Promise<Object>} Creation result
 */
export const createMaterial = async (materialData) => {
    try {
        const materialDoc = {
            ...materialData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), materialDoc);

        return {
            success: true,
            materialId: docRef.id,
            material: { id: docRef.id, ...materialDoc }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get all materials for a specific course and batch
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @returns {Promise<Object>} Materials list
 */
export const getMaterialsForBatch = async (courseId, batchNumber) => {
    try {
        const q = query(
            collection(db, MATERIALS_COLLECTION),
            where('courseId', '==', courseId),
            where('batchNumber', '==', batchNumber),
            orderBy('week', 'asc'),
            orderBy('order', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const materials = [];

        querySnapshot.forEach((doc) => {
            materials.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Group materials by week
        const materialsByWeek = materials.reduce((acc, material) => {
            const week = material.week;
            if (!acc[week]) {
                acc[week] = {
                    week,
                    title: material.weekTitle || `Week ${week}`,
                    materials: []
                };
            }
            acc[week].materials.push(material);
            return acc;
        }, {});

        return {
            success: true,
            materials: Object.values(materialsByWeek)
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            materials: []
        };
    }
};

/**
 * Update material information
 * @param {string} materialId - Material document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Update result
 */
export const updateMaterial = async (materialId, updateData) => {
    try {
        const materialRef = doc(db, MATERIALS_COLLECTION, materialId);

        await updateDoc(materialRef, {
            ...updateData,
            updatedAt: new Date()
        });

        return {
            success: true,
            message: 'Material updated successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Delete a material and its associated file
 * @param {string} materialId - Material document ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteMaterial = async (materialId) => {
    try {
        // Get material data first
        const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
        const materialDoc = await getDoc(materialRef);

        if (!materialDoc.exists()) {
            return {
                success: false,
                error: 'Material not found'
            };
        }

        const materialData = materialDoc.data();

        // Delete file from storage if it exists
        if (materialData.filePath) {
            try {
                const fileRef = ref(storage, materialData.filePath);
                await deleteObject(fileRef);
            } catch (fileError) {
                // File might already be deleted, continue with document deletion
            }
        }

        // Delete document from Firestore
        await deleteDoc(materialRef);

        return {
            success: true,
            message: 'Material deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get materials for a specific week
 * @param {string} courseId - Course identifier
 * @param {number} batchNumber - Batch number
 * @param {number} week - Week number
 * @returns {Promise<Object>} Week materials
 */
export const getWeekMaterials = async (courseId, batchNumber, week) => {
    try {
        const q = query(
            collection(db, MATERIALS_COLLECTION),
            where('courseId', '==', courseId),
            where('batchNumber', '==', batchNumber),
            where('week', '==', week),
            orderBy('order', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const materials = [];

        querySnapshot.forEach((doc) => {
            materials.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            success: true,
            materials
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            materials: []
        };
    }
};

/**
 * Reorder materials within a week
 * @param {Array} materialIds - Array of material IDs in new order
 * @returns {Promise<Object>} Reorder result
 */
export const reorderMaterials = async (materialIds) => {
    try {
        const batch = db.batch();

        materialIds.forEach((materialId, index) => {
            const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
            batch.update(materialRef, {
                order: index + 1,
                updatedAt: new Date()
            });
        });

        await batch.commit();

        return {
            success: true,
            message: 'Materials reordered successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get supported file types for different material types
 * @returns {Object} Supported file types by material type
 */
export const getSupportedFileTypes = () => {
    return {
        video: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
        slides: ['.pdf', '.ppt', '.pptx'],
        assignment: ['.pdf', '.doc', '.docx'],
        notebook: ['.ipynb'],
        dataset: ['.zip', '.csv', '.json', '.txt'],
        document: ['.pdf', '.doc', '.docx', '.txt', '.md'],
        image: ['.jpg', '.jpeg', '.png', '.gif', '.svg']
    };
};

/**
 * Validate file type for material type
 * @param {File} file - File to validate
 * @param {string} materialType - Material type
 * @returns {boolean} Whether file type is valid
 */
export const validateFileType = (file, materialType) => {
    const supportedTypes = getSupportedFileTypes();
    const allowedExtensions = supportedTypes[materialType] || [];

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(fileExtension);
};

/**
 * Get file size limit for different material types (in MB)
 * @returns {Object} Size limits by material type
 */
export const getFileSizeLimits = () => {
    return {
        video: 500,      // 500 MB for videos
        slides: 50,      // 50 MB for presentations
        assignment: 10,  // 10 MB for assignments
        notebook: 5,     // 5 MB for notebooks
        dataset: 100,    // 100 MB for datasets
        document: 25,    // 25 MB for documents
        image: 5         // 5 MB for images
    };
};

/**
 * Validate file size for material type
 * @param {File} file - File to validate
 * @param {string} materialType - Material type
 * @returns {boolean} Whether file size is valid
 */
export const validateFileSize = (file, materialType) => {
    const sizeLimits = getFileSizeLimits();
    const maxSizeMB = sizeLimits[materialType] || 10;
    const fileSizeMB = file.size / (1024 * 1024);

    return fileSizeMB <= maxSizeMB;
};

export default {
    uploadMaterial,
    createMaterial,
    getMaterialsForBatch,
    updateMaterial,
    deleteMaterial,
    getWeekMaterials,
    reorderMaterials,
    getSupportedFileTypes,
    validateFileType,
    getFileSizeLimits,
    validateFileSize
};
