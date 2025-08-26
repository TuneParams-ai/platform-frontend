// src/hooks/useRecentReviews.js
import { useEffect, useState } from 'react';
import { subscribeToRecentReviews } from '../services/reviewService';

export const useRecentReviews = ({ limit = 6 } = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsub = subscribeToRecentReviews(({ reviews, error }) => {
            if (error) setError(error);
            else setReviews(reviews);
            setLoading(false);
        }, { limit });
        return () => unsub && unsub();
    }, [limit]);

    return { reviews, loading, error };
};
