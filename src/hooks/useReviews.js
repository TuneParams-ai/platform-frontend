// src/hooks/useReviews.js
import { useEffect, useState } from 'react';
import { subscribeToCourseReviews } from '../services/reviewService';

export const useReviews = (courseId, { limit = 20 } = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!courseId) return;
        setLoading(true);
        const unsub = subscribeToCourseReviews(
            courseId,
            ({ reviews, error }) => {
                if (error) setError(error);
                else setReviews(reviews);
                setLoading(false);
            },
            { limit }
        );
        return () => unsub && unsub();
    }, [courseId, limit]);

    return { reviews, loading, error };
};
