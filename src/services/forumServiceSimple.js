// Minimal forum service for testing - no composite indexes required
import {
    collection, doc, addDoc, getDoc, getDocs, updateDoc,
    query, where, limit, serverTimestamp, increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Categories
export const FORUM_CATEGORIES = {
    GENERAL: 'general',
    COURSES: 'courses',
    AI_ML: 'ai_ml',
    CAREERS: 'careers',
    PROJECTS: 'projects',
    HELP: 'help'
};

export const CATEGORY_LABELS = {
    [FORUM_CATEGORIES.GENERAL]: 'General Discussion',
    [FORUM_CATEGORIES.COURSES]: 'Course Discussions',
    [FORUM_CATEGORIES.AI_ML]: 'AI & Machine Learning',
    [FORUM_CATEGORIES.CAREERS]: 'Career Advice',
    [FORUM_CATEGORIES.PROJECTS]: 'Project Showcase',
    [FORUM_CATEGORIES.HELP]: 'Help & Support'
};

// Thread operations
export const createThread = async (threadData) => {
    try {
        const docRef = await addDoc(collection(db, 'forum_threads'), {
            ...threadData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            viewCount: 0,
            replyCount: 0,
            isPinned: false,
            isLocked: false,
            likedBy: [],
            reportedBy: [],
            lastReplyAt: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating thread: ", error);
        return { success: false, error: error.message };
    }
};

export const getThreads = async (category = null, pageSize = 10, lastDoc = null) => {
    try {
        let q;

        if (category) {
            // Only filter by category - no ordering
            q = query(
                collection(db, 'forum_threads'),
                where('category', '==', category),
                limit(pageSize)
            );
        } else {
            // Get all threads - no filtering or ordering
            q = query(
                collection(db, 'forum_threads'),
                limit(pageSize)
            );
        }

        const querySnapshot = await getDocs(q);
        const threads = [];

        querySnapshot.forEach((doc) => {
            threads.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
                lastReplyAt: doc.data().lastReplyAt?.toDate()
            });
        });

        // Sort client-side by creation date
        threads.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        return {
            success: true,
            threads,
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
            hasMore: querySnapshot.docs.length === pageSize
        };
    } catch (error) {
        console.error("Error getting threads: ", error);
        return { success: false, error: error.message };
    }
};

export const getThread = async (threadId) => {
    try {
        console.log('Getting thread with ID:', threadId);
        const docRef = doc(db, 'forum_threads', threadId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log('Thread found:', docSnap.id);
            // Increment view count
            await updateDoc(docRef, {
                viewCount: increment(1)
            });

            return {
                success: true,
                thread: {
                    id: docSnap.id,
                    ...docSnap.data(),
                    createdAt: docSnap.data().createdAt?.toDate(),
                    updatedAt: docSnap.data().updatedAt?.toDate(),
                    lastReplyAt: docSnap.data().lastReplyAt?.toDate()
                }
            };
        } else {
            console.log('Thread not found in database:', threadId);
            return { success: false, error: 'Thread not found' };
        }
    } catch (error) {
        console.error("Error getting thread: ", error);
        return { success: false, error: error.message };
    }
};

export const getReplies = async (threadId) => {
    try {
        // Simple query - only filter by threadId, no ordering
        const q = query(
            collection(db, 'forum_replies'),
            where('threadId', '==', threadId)
        );

        const querySnapshot = await getDocs(q);
        const replies = [];

        querySnapshot.forEach((doc) => {
            replies.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            });
        });

        // Sort replies by createdAt client-side
        replies.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return a.createdAt.getTime() - b.createdAt.getTime();
        });

        return { success: true, replies };
    } catch (error) {
        console.error("Error getting replies: ", error);
        return { success: false, error: error.message };
    }
};

export const createReply = async (replyData) => {
    try {
        const docRef = await addDoc(collection(db, 'forum_replies'), {
            ...replyData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            likedBy: [],
            reportedBy: []
        });

        // Update thread reply count and last reply info
        const threadRef = doc(db, 'forum_threads', replyData.threadId);
        await updateDoc(threadRef, {
            replyCount: increment(1),
            lastReplyAt: serverTimestamp(),
            lastReplyBy: replyData.authorName
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating reply: ", error);
        return { success: false, error: error.message };
    }
};

export const searchThreads = async (searchTerm, category = null) => {
    try {
        let q;

        if (category) {
            // Only filter by category
            q = query(
                collection(db, 'forum_threads'),
                where('category', '==', category)
            );
        } else {
            // Get all threads
            q = query(collection(db, 'forum_threads'));
        }

        const querySnapshot = await getDocs(q);
        const threads = [];
        const searchLower = searchTerm.toLowerCase();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.title.toLowerCase().includes(searchLower) ||
                data.content.toLowerCase().includes(searchLower)) {
                console.log('Found matching thread:', doc.id, data.title);
                threads.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                    lastReplyAt: data.lastReplyAt?.toDate()
                });
            }
        });

        // Sort by creation date client-side
        threads.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        console.log('Search results:', threads.length, 'threads found');
        return { success: true, threads: threads.slice(0, 20) };
    } catch (error) {
        console.error("Error searching threads: ", error);
        return { success: false, error: error.message };
    }
};
