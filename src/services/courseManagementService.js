import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// =====================================================
// COURSE OPERATIONS
// =====================================================

/**
 * Get all courses
 * @returns {Promise<Array>} Array of course objects
 */
export const getAllCourses = async () => {
    try {
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting courses:', error);
        throw error;
    }
};

/**
 * Get single course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Course object
 */
export const getCourse = async (courseId) => {
    try {
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);

        if (!courseDoc.exists()) {
            throw new Error('Course not found');
        }

        return {
            id: courseDoc.id,
            ...courseDoc.data()
        };
    } catch (error) {
        console.error('Error getting course:', error);
        throw error;
    }
};

/**
 * Create new course
 * @param {Object} courseData - Course data
 * @returns {Promise<string>} Created course ID
 */
export const createCourse = async (courseData) => {
    try {
        const coursesRef = collection(db, 'courses');
        const docRef = await addDoc(coursesRef, {
            ...courseData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
};

/**
 * Update existing course
 * @param {string} courseId - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<void>}
 */
export const updateCourse = async (courseId, courseData) => {
    try {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            ...courseData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
};

/**
 * Delete course (and all subcollections)
 * @param {string} courseId - Course ID
 * @returns {Promise<void>}
 */
export const deleteCourse = async (courseId) => {
    try {
        // Note: This only deletes the course document
        // Subcollections must be deleted separately or via Cloud Functions
        const courseRef = doc(db, 'courses', courseId);
        await deleteDoc(courseRef);

        // TODO: Add batch delete for subcollections or implement via Cloud Function
        console.warn('Remember to delete subcollections (batches, curriculum) manually or via Cloud Function');
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
};

// =====================================================
// CURRICULUM OPERATIONS
// =====================================================

/**
 * Get all curriculum sections for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} Array of curriculum sections
 */
export const getCourseCurriculum = async (courseId) => {
    try {
        console.log('Fetching curriculum for course:', courseId);
        const curriculumRef = collection(db, 'courses', courseId, 'curriculum');

        // Fetch without ordering to avoid index requirements
        const snapshot = await getDocs(curriculumRef);

        console.log('Curriculum snapshot size:', snapshot.size);
        const curriculum = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Curriculum doc:', doc.id, data);
            return {
                id: doc.id,
                ...data
            };
        });

        // Sort in memory by order field
        curriculum.sort((a, b) => (a.order || 0) - (b.order || 0));

        console.log('Processed curriculum:', curriculum);
        return curriculum;
    } catch (error) {
        console.error('Error getting curriculum:', error);
        throw error;
    }
};

/**
 * Add curriculum section to course
 * @param {string} courseId - Course ID
 * @param {Object} sectionData - Section data
 * @returns {Promise<string>} Created section ID
 */
export const addCurriculumSection = async (courseId, sectionData) => {
    try {
        const curriculumRef = collection(db, 'courses', courseId, 'curriculum');
        const docRef = await addDoc(curriculumRef, {
            ...sectionData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding curriculum section:', error);
        throw error;
    }
};

/**
 * Update curriculum section
 * @param {string} courseId - Course ID
 * @param {string} sectionId - Section ID
 * @param {Object} sectionData - Updated section data
 * @returns {Promise<void>}
 */
export const updateCurriculumSection = async (courseId, sectionId, sectionData) => {
    try {
        const sectionRef = doc(db, 'courses', courseId, 'curriculum', sectionId);
        await updateDoc(sectionRef, {
            ...sectionData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating curriculum section:', error);
        throw error;
    }
};

/**
 * Delete curriculum section
 * @param {string} courseId - Course ID
 * @param {string} sectionId - Section ID
 * @returns {Promise<void>}
 */
export const deleteCurriculumSection = async (courseId, sectionId) => {
    try {
        const sectionRef = doc(db, 'courses', courseId, 'curriculum', sectionId);
        await deleteDoc(sectionRef);
    } catch (error) {
        console.error('Error deleting curriculum section:', error);
        throw error;
    }
};

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Get all batches for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} Array of batch objects
 */
export const getCourseBatches = async (courseId) => {
    try {
        console.log('Fetching batches for course:', courseId);
        const batchesRef = collection(db, 'courses', courseId, 'batches');

        // Fetch without ordering to avoid index requirements
        const snapshot = await getDocs(batchesRef);

        console.log('Batches snapshot size:', snapshot.size);
        const batches = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Batch doc:', doc.id, data);
            return {
                id: doc.id,
                ...data
            };
        });

        // Sort in memory by batchNumber
        batches.sort((a, b) => (a.batchNumber || 0) - (b.batchNumber || 0));

        console.log('Processed batches:', batches);
        return batches;
    } catch (error) {
        console.error('Error getting batches:', error);
        throw error;
    }
};

/**
 * Get single batch
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @returns {Promise<Object>} Batch object
 */
export const getBatch = async (courseId, batchId) => {
    try {
        const batchRef = doc(db, 'courses', courseId, 'batches', batchId);
        const batchDoc = await getDoc(batchRef);

        if (!batchDoc.exists()) {
            throw new Error('Batch not found');
        }

        return {
            id: batchDoc.id,
            ...batchDoc.data()
        };
    } catch (error) {
        console.error('Error getting batch:', error);
        throw error;
    }
};

/**
 * Create new batch
 * @param {string} courseId - Course ID
 * @param {Object} batchData - Batch data
 * @returns {Promise<string>} Created batch ID
 */
export const createBatch = async (courseId, batchData) => {
    try {
        const batchesRef = collection(db, 'courses', courseId, 'batches');
        const docRef = await addDoc(batchesRef, {
            ...batchData,
            enrollmentCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating batch:', error);
        throw error;
    }
};

/**
 * Update batch
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {Object} batchData - Updated batch data
 * @returns {Promise<void>}
 */
export const updateBatch = async (courseId, batchId, batchData) => {
    try {
        const batchRef = doc(db, 'courses', courseId, 'batches', batchId);
        await updateDoc(batchRef, {
            ...batchData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating batch:', error);
        throw error;
    }
};

/**
 * Delete batch (and all subcollections)
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @returns {Promise<void>}
 */
export const deleteBatch = async (courseId, batchId) => {
    try {
        const batchRef = doc(db, 'courses', courseId, 'batches', batchId);
        await deleteDoc(batchRef);

        // TODO: Add batch delete for videos and schedules subcollections
        console.warn('Remember to delete subcollections (videos, schedule) manually or via Cloud Function');
    } catch (error) {
        console.error('Error deleting batch:', error);
        throw error;
    }
};

// =====================================================
// VIDEO OPERATIONS
// =====================================================

/**
 * Get all videos for a batch
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @returns {Promise<Array>} Array of video objects
 */
export const getBatchVideos = async (courseId, batchId) => {
    try {
        const videosRef = collection(db, 'courses', courseId, 'batches', batchId, 'videos');
        const q = query(videosRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting videos:', error);
        throw error;
    }
};

/**
 * Add video to batch
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {Object} videoData - Video data
 * @returns {Promise<string>} Created video ID
 */
export const addBatchVideo = async (courseId, batchId, videoData) => {
    try {
        const videosRef = collection(db, 'courses', courseId, 'batches', batchId, 'videos');
        const docRef = await addDoc(videosRef, {
            ...videoData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding video:', error);
        throw error;
    }
};

/**
 * Update video
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {string} videoId - Video ID
 * @param {Object} videoData - Updated video data
 * @returns {Promise<void>}
 */
export const updateBatchVideo = async (courseId, batchId, videoId, videoData) => {
    try {
        const videoRef = doc(db, 'courses', courseId, 'batches', batchId, 'videos', videoId);
        await updateDoc(videoRef, {
            ...videoData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating video:', error);
        throw error;
    }
};

/**
 * Delete video
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {string} videoId - Video ID
 * @returns {Promise<void>}
 */
export const deleteBatchVideo = async (courseId, batchId, videoId) => {
    try {
        const videoRef = doc(db, 'courses', courseId, 'batches', batchId, 'videos', videoId);
        await deleteDoc(videoRef);
    } catch (error) {
        console.error('Error deleting video:', error);
        throw error;
    }
};

// =====================================================
// SCHEDULE OPERATIONS
// =====================================================

/**
 * Get all schedule entries for a batch
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @returns {Promise<Array>} Array of schedule objects
 */
export const getBatchSchedule = async (courseId, batchId) => {
    try {
        const scheduleRef = collection(db, 'courses', courseId, 'batches', batchId, 'schedule');
        const q = query(scheduleRef, orderBy('date', 'asc'), orderBy('time', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting schedule:', error);
        throw error;
    }
};

/**
 * Add schedule entry to batch
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {Object} scheduleData - Schedule data
 * @returns {Promise<string>} Created schedule ID
 */
export const addBatchSchedule = async (courseId, batchId, scheduleData) => {
    try {
        const scheduleRef = collection(db, 'courses', courseId, 'batches', batchId, 'schedule');
        const docRef = await addDoc(scheduleRef, {
            ...scheduleData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding schedule:', error);
        throw error;
    }
};

/**
 * Update schedule entry
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {string} scheduleId - Schedule ID
 * @param {Object} scheduleData - Updated schedule data
 * @returns {Promise<void>}
 */
export const updateBatchSchedule = async (courseId, batchId, scheduleId, scheduleData) => {
    try {
        const scheduleEntryRef = doc(db, 'courses', courseId, 'batches', batchId, 'schedule', scheduleId);
        await updateDoc(scheduleEntryRef, {
            ...scheduleData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        throw error;
    }
};

/**
 * Delete schedule entry
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {string} scheduleId - Schedule ID
 * @returns {Promise<void>}
 */
export const deleteBatchSchedule = async (courseId, batchId, scheduleId) => {
    try {
        const scheduleEntryRef = doc(db, 'courses', courseId, 'batches', batchId, 'schedule', scheduleId);
        await deleteDoc(scheduleEntryRef);
    } catch (error) {
        console.error('Error deleting schedule:', error);
        throw error;
    }
};

// =====================================================
// BULK OPERATIONS
// =====================================================

/**
 * Get complete course with all subcollections
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Complete course object with batches, curriculum, etc.
 */
export const getCompleteCourse = async (courseId) => {
    try {
        console.log('🔍 getCompleteCourse called for:', courseId);
        
        console.log('📚 Fetching base course data...');
        const course = await getCourse(courseId);
        console.log('✅ Base course:', course);
        
        console.log('📦 Fetching batches...');
        const batches = await getCourseBatches(courseId);
        console.log('✅ Batches fetched:', batches);
        
        console.log('📖 Fetching curriculum...');
        const curriculum = await getCourseCurriculum(courseId);
        console.log('✅ Curriculum fetched:', curriculum);

        // Get videos and schedules for each batch
        console.log('🎥 Fetching videos and schedules for each batch...');
        const batchesWithDetails = await Promise.all(
            batches.map(async (batch) => {
                console.log('Processing batch:', batch.id);
                const videos = await getBatchVideos(courseId, batch.id);
                const schedule = await getBatchSchedule(courseId, batch.id);
                return {
                    ...batch,
                    videos,
                    schedule
                };
            })
        );
        
        const completeCourse = {
            ...course,
            batches: batchesWithDetails,
            curriculum
        };
        
        console.log('✅ Complete course data:', completeCourse);
        return completeCourse;
    } catch (error) {
        console.error('❌ Error getting complete course:', error);
        throw error;
    }
};

/**
 * Batch write multiple videos at once
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {Array} videos - Array of video objects
 * @returns {Promise<void>}
 */
export const batchAddVideos = async (courseId, batchId, videos) => {
    try {
        const batch = writeBatch(db);

        videos.forEach((video) => {
            const videoRef = doc(collection(db, 'courses', courseId, 'batches', batchId, 'videos'));
            batch.set(videoRef, {
                ...video,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error batch adding videos:', error);
        throw error;
    }
};

/**
 * Batch write multiple schedule entries at once
 * @param {string} courseId - Course ID
 * @param {string} batchId - Batch ID
 * @param {Array} scheduleEntries - Array of schedule objects
 * @returns {Promise<void>}
 */
export const batchAddSchedule = async (courseId, batchId, scheduleEntries) => {
    try {
        const batch = writeBatch(db);

        scheduleEntries.forEach((entry) => {
            const scheduleRef = doc(collection(db, 'courses', courseId, 'batches', batchId, 'schedule'));
            batch.set(scheduleRef, {
                ...entry,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error batch adding schedule:', error);
        throw error;
    }
};
