import { useState, useEffect } from 'react';
import { getAllCourses } from '../services/courseManagementService';
import { coursesData as staticCoursesData } from '../data/coursesData';

/**
 * Custom hook to fetch courses from Firebase Firestore
 * Falls back to static data if Firebase fetch fails
 * 
 * @returns {Object} { courses, loading, error, refetch }
 */
export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useStatic, setUseStatic] = useState(false);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to fetch from Firebase
            const firebaseCourses = await getAllCourses();

            if (firebaseCourses && firebaseCourses.length > 0) {
                setCourses(firebaseCourses);
                setUseStatic(false);
            } else {
                // If no courses in Firebase, use static data
                console.warn('No courses found in Firebase, using static data');
                setCourses(staticCoursesData);
                setUseStatic(true);
            }
        } catch (err) {
            console.error('Error fetching courses from Firebase:', err);
            setError(err.message);

            // Fallback to static data
            setCourses(staticCoursesData);
            setUseStatic(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Function to manually refetch courses
    const refetch = () => {
        fetchCourses();
    };

    return {
        courses,
        loading,
        error,
        refetch,
        useStatic // Indicates if using static fallback data
    };
};

/**
 * Custom hook to fetch a single course by ID from Firebase
 * Falls back to static data if Firebase fetch fails
 * 
 * @param {string} courseId - Course ID to fetch
 * @returns {Object} { course, loading, error, refetch }
 */
export const useCourse = (courseId) => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useStatic, setUseStatic] = useState(false);

    const fetchCourse = async () => {
        if (!courseId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Try to fetch from Firebase using getAllCourses (since getCourse requires import)
            const { getCourse } = await import('../services/courseManagementService');
            const firebaseCourse = await getCourse(courseId);

            if (firebaseCourse) {
                setCourse(firebaseCourse);
                setUseStatic(false);
            } else {
                // Fallback to static data
                const staticCourse = staticCoursesData.find(c => c.id === courseId);
                setCourse(staticCourse || null);
                setUseStatic(true);
            }
        } catch (err) {
            console.error(`Error fetching course ${courseId} from Firebase:`, err);
            setError(err.message);

            // Fallback to static data
            const staticCourse = staticCoursesData.find(c => c.id === courseId);
            setCourse(staticCourse || null);
            setUseStatic(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const refetch = () => {
        fetchCourse();
    };

    return {
        course,
        loading,
        error,
        refetch,
        useStatic
    };
};

export default useCourses;
